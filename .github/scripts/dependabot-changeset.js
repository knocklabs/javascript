/**
 * Creates a changeset file for Dependabot PRs that update production
 * dependencies in published @knocklabs/* packages.
 *
 * Skips devDependency-only changes since those don't require a release.
 *
 * This script is only run from a workflow gated to dependabot[bot],
 * so we trust that the changes are dependency updates.
 *
 * Environment variables:
 *   PR_TITLE      - The pull request title (used as the changeset description)
 *   PR_NUMBER     - The pull request number (used in the changeset filename)
 *   GITHUB_OUTPUT - Path to the GitHub Actions output file
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const prTitle = process.env.PR_TITLE;
const prNumber = process.env.PR_NUMBER;
const githubOutput = process.env.GITHUB_OUTPUT;

if (!prTitle || !prNumber || !githubOutput) {
  console.error(
    "Missing required environment variables: PR_TITLE, PR_NUMBER, GITHUB_OUTPUT",
  );
  process.exit(1);
}

const changesetFile = path.join(".changeset", `dependabot-pr-${prNumber}.md`);

function setOutput(key, value) {
  fs.appendFileSync(githubOutput, `${key}=${value}\n`);
}

// If changeset already exists, skip
if (fs.existsSync(changesetFile)) {
  console.log("Changeset already exists, skipping");
  setOutput("created", "false");
  process.exit(0);
}

// Find all package.json files changed in the latest commit
const diffOutput = execSync(
  "git diff --name-only HEAD~1 HEAD -- '**/package.json'",
  { encoding: "utf-8" },
).trim();

if (!diffOutput) {
  console.log("No package.json files changed");
  setOutput("created", "false");
  process.exit(0);
}

const changedFiles = diffOutput.split("\n").filter(Boolean);
const packages = [];

for (const pkgFile of changedFiles) {
  const content = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
  const pkgName = content.name || "";

  if (content.private || !pkgName.startsWith("@knocklabs/")) {
    continue;
  }

  // Only include packages where production dependencies changed,
  // not devDependency-only updates
  let oldDeps = {};
  try {
    const oldContent = execSync(`git show "HEAD~1:${pkgFile}"`, {
      encoding: "utf-8",
    });
    oldDeps = JSON.parse(oldContent).dependencies || {};
  } catch {
    // File may not exist in previous commit
  }

  const newDeps = content.dependencies || {};
  const sortedOld = JSON.stringify(oldDeps, Object.keys(oldDeps).sort());
  const sortedNew = JSON.stringify(newDeps, Object.keys(newDeps).sort());

  if (sortedOld === sortedNew) {
    console.log(`Only devDependency changes in ${pkgName}, skipping`);
    continue;
  }

  packages.push(pkgName);
}

const uniquePackages = [...new Set(packages)].sort();

if (uniquePackages.length === 0) {
  console.log("No published @knocklabs packages were affected");
  setOutput("created", "false");
  process.exit(0);
}

// Generate changeset file
const lines = [
  "---",
  ...uniquePackages.map((pkg) => `"${pkg}": patch`),
  "---",
  "",
  prTitle,
  "",
];

fs.writeFileSync(changesetFile, lines.join("\n"));

console.log(`Created changeset: ${changesetFile}`);
console.log(fs.readFileSync(changesetFile, "utf-8"));
setOutput("created", "true");
