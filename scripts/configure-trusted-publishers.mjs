// Configures (or updates) the npm trusted publisher for every publishable
// `@knocklabs/*` workspace so releases authenticate via OIDC from
// .github/workflows/release.yml instead of a long-lived NPM_TOKEN.
//
// Run this LOCALLY as an npm org admin:
//
//   npm login                 # account-level 2FA must be enabled
//   yarn release:configure-trust
//
// Uses for it:
//   - Initial migration: enroll all current packages in one pass.
//   - After adding a new published package (see RELEASES.md): re-run to
//     enroll it. `npm trust` is add/update, so re-running is safe.
//
// Requirements: npm CLI >= 11.10.0 (bulk trusted publishing) and account 2FA.
// `npm trust` prompts for an OTP; there is a "skip 2FA for 5 minutes" window that
// comfortably covers all of our packages in a single run. This is deliberately a
// local, interactive task — it never runs in CI, so no publish token lives there.

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const REPO = "knocklabs/javascript";
const WORKFLOW = "release.yml";
const ENVIRONMENT = "production-release";
const PACKAGES_DIR = "packages";
const SLEEP_MS = 2000; // npm rate-limits trusted-publisher writes.

function publishablePackages() {
  const names = [];
  for (const entry of readdirSync(PACKAGES_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    let pkg;
    try {
      pkg = JSON.parse(
        readFileSync(join(PACKAGES_DIR, entry.name, "package.json"), "utf8"),
      );
    } catch {
      continue;
    }
    if (pkg.private) continue;
    if (!pkg.name?.startsWith("@knocklabs/")) continue;
    names.push(pkg.name);
  }
  return names.sort();
}

function npmMajorMinorOk() {
  try {
    const v = execFileSync("npm", ["--version"], { encoding: "utf8" }).trim();
    const [major, minor] = v.split(".").map(Number);
    return major > 11 || (major === 11 && minor >= 10);
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!npmMajorMinorOk()) {
  console.error(
    "npm >= 11.10.0 is required for `npm trust`. Run `npm install -g npm@latest` first.",
  );
  process.exit(1);
}

const packages = publishablePackages();
console.log(
  `Configuring trusted publishers for ${packages.length} packages ` +
    `(${REPO} → ${WORKFLOW}, environment: ${ENVIRONMENT}):\n`,
);

let failures = 0;
for (let i = 0; i < packages.length; i++) {
  const name = packages[i];
  console.log(`• ${name}`);
  try {
    execFileSync(
      "npm",
      [
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
      ],
      { stdio: "inherit" },
    );
  } catch {
    failures++;
    console.error(`  ✗ failed to configure ${name}`);
  }
  if (i < packages.length - 1) await sleep(SLEEP_MS);
}

if (failures) {
  console.error(`\nDone with ${failures} failure(s).`);
  process.exit(1);
}
console.log("\nAll packages configured for trusted publishing. ✅");
