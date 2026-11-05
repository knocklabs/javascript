/**
 * Sets up and checks npm trusted publishing (OIDC) for the publishable
 * @knocklabs/* packages in packages/.
 *
 * Releases publish from .github/workflows/release.yml without an npm token, so
 * every package needs a trusted publisher on npm that points at that workflow.
 * npm only lets you add one to a package name that already exists on the
 * registry, so a brand-new package needs a one-time bootstrap from a person.
 *
 * Commands:
 *   bootstrap [package...] [--dry-run]
 *     Run locally with `yarn release:bootstrap`. For each package (all of them
 *     when none are named), publishes a 0.0.0 placeholder if the name is not on
 *     npm yet, then adds the trusted publisher. Needs npm >= 11.15.0 and an
 *     `npm login` session on an account with 2FA. `--dry-run` prints the npm
 *     commands instead of running them.
 *
 *   check
 *     Run by `release:publish` before anything is built or published. Fails
 *     when a publishable package is not on npm yet, because its first version
 *     cannot be published through trusted publishing.
 */
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const REGISTRY = "https://registry.npmjs.org";

// These must match the trusted publisher config on npm.
const REPO = "knocklabs/javascript";
const WORKFLOW = "release.yml";
const ENVIRONMENT = "production-release";

const PLACEHOLDER_VERSION = "0.0.0";
const MIN_NPM_VERSION = "11.15.0"; // npm's docs require this for `npm trust`
const TRUST_DELAY_MS = 2000; // npm rate-limits trusted publisher writes
const TRUST_EXPIRY_DAYS = 2; // npm drops a new config that has not published

export const publishablePackages = ({ root = ROOT } = {}) => {
  const packagesDir = join(root, "packages");
  const packages = [];
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let manifest;
    try {
      manifest = JSON.parse(
        readFileSync(join(packagesDir, entry.name, "package.json"), "utf8"),
      );
    } catch {
      continue;
    }
    if (manifest.private || !manifest.name?.startsWith("@knocklabs/")) continue;
    packages.push(manifest);
  }
  return packages.sort((a, b) => a.name.localeCompare(b.name));
};

const existsOnNpm = async ({ name }) => {
  // Scoped names keep the leading @ and percent-encode the slash.
  const res = await fetch(`${REGISTRY}/${name.replace("/", "%2F")}`, {
    method: "HEAD",
  });
  if (res.status === 404) return false;
  if (!res.ok)
    throw new Error(`npm registry returned ${res.status} for ${name}`);
  return true;
};

export const findMissingPackages = async ({ packages }) => {
  const found = await Promise.all(
    packages.map(({ name }) => existsOnNpm({ name })),
  );
  return packages.filter((_, i) => !found[i]);
};

// The real first release would collide with the placeholder and be skipped
// by `--tolerate-republish`, leaving the placeholder as the only version.
export const placeholderCollisions = ({ packages }) =>
  packages.filter(({ version }) => version === PLACEHOLDER_VERSION);

export const isAtLeast = ({ version, minimum }) => {
  const a = version.split(".").map(Number);
  const b = minimum.split(".").map(Number);
  for (let i = 0; i < b.length; i++) {
    if ((a[i] ?? 0) !== b[i]) return (a[i] ?? 0) > b[i];
  }
  return true;
};

const run = ({ command, args, cwd, dryRun }) => {
  console.log(`$ ${[command, ...args].join(" ")}`);
  if (dryRun) return;
  execFileSync(command, args, { cwd, stdio: "inherit" });
};

// `npm trust` needs a recent npm, and every npm write below needs a login. In
// a dry run these are reported but do not stop the run.
const npmSetupProblems = () => {
  const problems = [];
  const version = execFileSync("npm", ["--version"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();
  if (!isAtLeast({ version, minimum: MIN_NPM_VERSION })) {
    problems.push(
      `npm ${version} is too old for \`npm trust\` (needs ${MIN_NPM_VERSION}+). ` +
        "Run `npm install -g npm@latest`.",
    );
  }
  try {
    execFileSync("npm", ["whoami", "--registry", REGISTRY], {
      stdio: "ignore",
    });
  } catch {
    problems.push("Not logged in to npm. Run `npm login`.");
  }
  return problems;
};

const publishPlaceholder = ({ manifest, dryRun }) => {
  const dir = mkdtempSync(join(tmpdir(), "knock-npm-placeholder-"));
  try {
    const placeholder = {
      name: manifest.name,
      version: PLACEHOLDER_VERSION,
      description: `Placeholder that reserves ${manifest.name}. Real releases are published from https://github.com/${REPO}.`,
      license: manifest.license ?? "MIT",
      repository: manifest.repository,
    };
    writeFileSync(
      join(dir, "package.json"),
      `${JSON.stringify(placeholder, null, 2)}\n`,
    );
    writeFileSync(join(dir, "README.md"), `${placeholder.description}\n`);
    run({
      command: "npm",
      args: [
        "publish",
        "--access",
        "public",
        "--tag",
        "placeholder",
        "--registry",
        REGISTRY,
      ],
      cwd: dir,
      dryRun,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

const addTrustedPublisher = ({ name, dryRun }) => {
  run({
    command: "npm",
    args: [
      "trust",
      "github",
      name,
      "--repo",
      REPO,
      "--file",
      WORKFLOW,
      "--env",
      ENVIRONMENT,
      "--allow-publish",
      "--yes",
      "--registry",
      REGISTRY,
    ],
    dryRun,
  });
};

const bootstrap = async ({ names, dryRun }) => {
  const all = publishablePackages();
  const unknown = names.filter((n) => !all.some((p) => p.name === n));
  if (unknown.length) {
    console.error(
      `Not a publishable @knocklabs/* package in packages/: ${unknown.join(", ")}`,
    );
    process.exit(1);
  }
  const targets = names.length
    ? all.filter((p) => names.includes(p.name))
    : all;

  const problems = npmSetupProblems();
  if (problems.length) {
    for (const problem of problems) console.error(problem);
    if (!dryRun) process.exit(1);
  }

  const missing = await findMissingPackages({ packages: targets });
  const collisions = placeholderCollisions({ packages: missing });
  if (collisions.length) {
    console.error(
      `${collisions.map((p) => p.name).join(", ")} still at version ` +
        `${PLACEHOLDER_VERSION}, which the placeholder uses. Add a changeset ` +
        "or set a higher version first.",
    );
    process.exit(1);
  }

  for (const manifest of missing) {
    console.log(
      `\n${manifest.name} is not on npm yet, publishing a placeholder.`,
    );
    publishPlaceholder({ manifest, dryRun });
  }

  console.log(
    `\nAdding trusted publishers (${REPO}, ${WORKFLOW}, environment ${ENVIRONMENT}):`,
  );
  const failed = [];
  for (const [i, { name }] of targets.entries()) {
    if (i > 0 && !dryRun) {
      await new Promise((resolve) => setTimeout(resolve, TRUST_DELAY_MS));
    }
    try {
      addTrustedPublisher({ name, dryRun });
    } catch {
      failed.push(name);
    }
  }

  if (failed.length) {
    console.error(
      `\nCould not add a trusted publisher for: ${failed.join(", ")}.\n` +
        "npm allows one per package. If one already exists, find its id with " +
        "`npm trust list <package>`, remove it with " +
        "`npm trust revoke <package> --id <id>`, and run this again.",
    );
  }
  if (failed.length < targets.length && !dryRun) {
    const deadline = new Date(Date.now() + TRUST_EXPIRY_DAYS * 86_400_000);
    console.log(
      `\nnpm drops a new trusted publisher that has not published within ` +
        `${TRUST_EXPIRY_DAYS} days. Merge the Version PR that releases these ` +
        `packages before ${deadline.toISOString().slice(0, 16).replace("T", " ")} UTC.`,
    );
  }
  if (failed.length) process.exit(1);
};

const check = async () => {
  const packages = publishablePackages();
  const missing = (await findMissingPackages({ packages })).map((p) => p.name);
  if (!missing.length) {
    console.log(`All ${packages.length} publishable packages exist on npm.`);
    return;
  }
  // GitHub Actions turns this line into an error annotation on the run.
  console.log(
    `::error title=Package not on npm yet::${missing.join(", ")} ` +
      `${missing.length === 1 ? "is" : "are"} not on npm yet, and a first ` +
      "version cannot be published through trusted publishing. Run " +
      `\`yarn release:bootstrap ${missing.join(" ")}\` locally, then re-run ` +
      "this workflow. See RELEASES.md.",
  );
  process.exit(1);
};

const main = async () => {
  const [command, ...args] = process.argv.slice(2);
  const flags = args.filter((a) => a.startsWith("-"));
  const names = args.filter((a) => !a.startsWith("-"));
  const badFlags = flags.filter((f) => f !== "--dry-run");

  if (command === "check" && !args.length) {
    await check();
  } else if (command === "bootstrap" && !badFlags.length) {
    await bootstrap({ names, dryRun: flags.includes("--dry-run") });
  } else {
    console.error(
      "Usage: npm-trusted-publishing.mjs check\n" +
        "       npm-trusted-publishing.mjs bootstrap [package...] [--dry-run]",
    );
    process.exit(1);
  }
};

// Tests import this module, so only run the CLI when it is the entry point.
if (import.meta.main) await main();
