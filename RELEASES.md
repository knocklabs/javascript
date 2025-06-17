# Release Process

This document outlines how to manage **canary**, **release candidate (RC)**, and **stable** releases of our packages using [Changesets](https://github.com/changesets/changesets) and GitHub Actions.

## Branch Overview

| Branch   | Purpose                         | Tag       | Description                                   |
|----------|----------------------------------|-----------|-----------------------------------------------|
| `main`   | Stable release                  | `latest`  | Final production-ready versions               |
| `canary` | Ongoing integration/dev builds  | `canary`  | Publishes preview builds for testing          |
| `rc`     | Release candidate cycle         | `rc`      | Publishes versions under test for GA release  |

---

## Branch Lifecycle

- `canary` is a **long-lived** branch for ongoing integration builds.
- `rc` is a **temporary branch**, created per release cycle and typically deleted after merging into `main`.

---

## Initial Setup

### Canary Branch

1. Create from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b canary
   npx changeset pre enter canary
   git add .changeset/pre.json
   git commit -am "enter canary prerelease mode"
   git push origin canary
   ```

   > Note: `-am` only stages tracked files. Use `git add` if `.changeset/pre.json` is new.

2. Merge PRs into `canary` with changesets.

3. Canary versions will look like `1.2.3-canary.0`, `1.2.3-canary.1`, etc.

### RC Branch (per release cycle)

Only create this when you're preparing a stable release from `canary` or `main`.

1. Create from `main`:
   ```bash
   git checkout main
   git pull
   git checkout -b rc
   npx changeset pre enter rc
   git add .changeset/pre.json
   git commit -am "enter rc prerelease mode"
   git push origin rc
   ```

2. Merge PRs into `rc` with changesets.

3. RC versions will look like `1.2.3-rc.0`, `1.2.3-rc.1`, etc.

---

## Canary Releases

### When to Use

- For every merged PR that should be testable in production-like environments without waiting for a full release.

### How It Works

1. Create a PR and merge it into the `canary` branch.
2. GitHub Actions will:
   - Verify pre.json is in canary mode.
   - Create a version PR if needed.
   - Publish the version to npm with the `canary` tag once merged.

### Install a Canary Version

```bash
npm install @knocklabs/some-package@canary
```

---

## RC Releases

### When to Use

- When preparing for a stable release and want to QA the build across environments.

### How It Works

1. Merge PRs with changesets into the `rc` branch.
2. GitHub Actions will:
   - Verify pre.json is in rc mode.
   - Create a version PR if needed.
   - Publish the version to npm with the `rc` tag once merged.

### Install an RC Version

```bash
npm install @knocklabs/some-package@rc
```

---

## Stable Releases

### When to Use

- When the RC has been fully tested and approved for production.

### How It Works

1. On the `rc` branch:
   ```bash
   npx changeset pre exit
   npx changeset version
   git commit -am "exit rc prerelease mode"
   git push origin rc
   ```

2. Merge `rc` into `main`.

3. GitHub Actions on `main` will:
   - Check for `.changeset/pre.json`. If it exists, the workflow will fail to prevent accidental prerelease publication to `latest`.
   - If all looks good, it will create a version PR or publish the stable version directly to the `latest` npm tag.

### Install a Stable Version

```bash
npm install @knocklabs/some-package
```

---

## Safeguards in CI

- `main` is blocked from publishing if `.changeset/pre.json` exists (pre-release guard).
- `canary`/`rc` require valid `.changeset/pre.json` matching the expected tag.
- Only merged PRs will trigger a publish — direct commits do not publish.
- Releases are published when a version PR is merged into the branch.

---

## Commands Reference

```bash
# Enter prerelease mode
npx changeset pre enter canary  # or rc

# Exit prerelease mode
npx changeset pre exit

# Apply version bumps and changelog updates
npx changeset version

# Publish packages (CI will handle this normally)
npx changeset publish
```

> `npx changeset version`: Applies all pending changesets, bumps versions, and updates changelogs.

---

Let an engineer on the team know if you're unsure which type of release is appropriate or if any `.changeset/pre.json` state looks incorrect.

This process ensures stable releases are intentional, pre-releases are safe, and GitHub Actions handles the rest automatically.