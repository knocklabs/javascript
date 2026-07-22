// Lists publishable `@knocklabs/*` workspaces whose current version is not yet on
// the npm registry.
//
// Two uses in release.yml:
//   1. version job — gates the build/publish jobs (`should-publish`) so they only
//      run when a Version PR merge (or canary→main promotion) introduces a new
//      version. This mirrors the idempotency the old `--tolerate-republish` gave us.
//   2. publish job (`--require-existing`) — pre-flight that fails LOUDLY before any
//      publish if a package being released does not exist on npm yet. A brand-new
//      package's first version cannot be published via OIDC trusted publishing, so
//      we point the maintainer at the bootstrap runbook instead of letting them
//      decode a misleading npm/yarn auth error.
//
// Read-only and unauthenticated — it only does GETs against the public registry.

import { readdirSync, readFileSync, appendFileSync } from "node:fs";
import { join } from "node:path";

const REGISTRY = "https://registry.npmjs.org";
const PACKAGES_DIR = "packages";

function publishableWorkspaces() {
  const workspaces = [];
  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const pkgPath = join(PACKAGES_DIR, entry.name, "package.json");
    let pkg;
    try {
      pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    } catch {
      continue;
    }
    if (pkg.private) continue;
    if (!pkg.name?.startsWith("@knocklabs/")) continue;
    workspaces.push({ name: pkg.name, version: pkg.version });
  }
  return workspaces.sort((a, b) => a.name.localeCompare(b.name));
}

async function registryInfo(name) {
  // Scoped names need the slash percent-encoded; the leading @ is kept as-is.
  const res = await fetch(`${REGISTRY}/${name.replace("/", "%2F")}`, {
    headers: { accept: "application/vnd.npm.install-v1+json" },
  });
  if (res.status === 404) return { exists: false, versions: {} };
  if (!res.ok) throw new Error(`Registry returned ${res.status} for ${name}`);
  const body = await res.json();
  return { exists: true, versions: body.versions ?? {} };
}

const requireExisting = process.argv.includes("--require-existing");

const workspaces = publishableWorkspaces();
const toPublish = [];
const newPackages = [];

for (const ws of workspaces) {
  const info = await registryInfo(ws.name);
  if (!info.exists) {
    newPackages.push(ws.name);
    toPublish.push(ws);
  } else if (!info.versions[ws.version]) {
    toPublish.push(ws);
  }
}

const shouldPublish = toPublish.length > 0;

console.log(`Publishable workspaces: ${workspaces.length}`);
console.log(
  `To publish: ${toPublish.map((p) => `${p.name}@${p.version}`).join(", ") || "(none)"}`,
);
if (newPackages.length) {
  console.log(`Not yet on npm (new packages): ${newPackages.join(", ")}`);
}

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(
    process.env.GITHUB_OUTPUT,
    `should-publish=${shouldPublish}\n` +
      `to-publish=${JSON.stringify(toPublish)}\n` +
      `new-packages=${JSON.stringify(newPackages)}\n`,
  );
}

if (requireExisting && newPackages.length) {
  const names = newPackages.join(", ");
  const verb = newPackages.length === 1 ? "does" : "do";
  console.log(
    `::error title=New package not enrolled for trusted publishing::${names} ` +
      `${verb} not exist on npm yet. A package's first version cannot be published ` +
      `via OIDC trusted publishing — see RELEASES.md (Adding a new published ` +
      `package) for the one-time bootstrap, then re-run this release.`,
  );
  process.exit(1);
}
