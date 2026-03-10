/**
 * Automatically creates a changeset file for Dependabot PRs that update
 * production dependencies in published @knocklabs/* packages.
 *
 * This script is intended to be run in a GitHub Actions workflow triggered
 * by pull_request_target events from dependabot[bot].
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
  "git diff --name-only HEAD~1 HEAD -- '**/package.json' 'package.json'",
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
  // Skip root package.json (private monorepo root)
  if (pkgFile === "package.json") {
    continue;
  }

  // Get old dependencies
  let oldDeps = {};
  try {
    const oldContent = execSync(`git show "HEAD~1:${pkgFile}"`, {
      encoding: "utf-8",
    });
    oldDeps = JSON.parse(oldContent).dependencies || {};
  } catch {
    // File may not exist in previous commit (new package)
    oldDeps = {};
  }

  // Get new package contents
  const newContent = execSync(`git show "HEAD:${pkgFile}"`, {
    encoding: "utf-8",
  });
  const newPkg = JSON.parse(newContent);
  const newDeps = newPkg.dependencies || {};

  // Compare dependencies using sorted keys for stable comparison
  const sortedOld = JSON.stringify(oldDeps, Object.keys(oldDeps).sort());
  const sortedNew = JSON.stringify(newDeps, Object.keys(newDeps).sort());

  if (sortedOld === sortedNew) {
    console.log(`No production dependency changes in ${pkgFile}, skipping`);
    continue;
  }

  const pkgName = newPkg.name || "";
  const isPrivate = newPkg.private === true;

  if (isPrivate) {
    console.log(`Skipping private package: ${pkgName}`);
    continue;
  }

  if (!pkgName.startsWith("@knocklabs/")) {
    console.log(`Skipping non-@knocklabs package: ${pkgName}`);
    continue;
  }

  packages.push(pkgName);
}

// Deduplicate and sort
const uniquePackages = [...new Set(packages)].sort();

if (uniquePackages.length === 0) {
  console.log("No production dependency changes in published packages");
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

fs.mkdirSync(path.dirname(changesetFile), { recursive: true });
fs.writeFileSync(changesetFile, lines.join("\n"));

console.log(`Created changeset: ${changesetFile}`);
console.log(fs.readFileSync(changesetFile, "utf-8"));
setOutput("created", "true");
