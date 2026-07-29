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

## How publishing is authenticated (OIDC trusted publishing)

Packages are published with **npm OIDC trusted publishing** and **provenance** —
there is no long-lived `NPM_TOKEN`. Authentication is a short-lived token minted
per run from GitHub's OIDC, and each published tarball carries a provenance
attestation linking it to the exact commit and workflow run.

[`release.yml`](.github/workflows/release.yml) is split into four jobs so the OIDC
token is isolated to a job that runs nothing but the publish (see
[KNO-13137](https://linear.app/knock/issue/KNO-13137) and the
[TanStack postmortem](https://tanstack.com/blog/npm-supply-chain-compromise-postmortem)):

| Job | Role | `id-token` | Install |
|-----|------|:----------:|:-------:|
| `version` | Opens the "Version Packages" PR | no | yes |
| `build`   | `yarn build:packages`, uploads `dist` (runs dependency scripts) | no | yes |
| `publish` | Runs **only** `yarn npm publish` → OIDC + provenance | **yes** | **no** |
| `release` | Pushes git tags + GitHub Releases via `changesets/action` | no | yes |

This requires **Yarn ≥ 4.10.3** (scoped-package OIDC support; the repo is pinned to
4.17.x) and publishes against `registry.npmjs.org` (set via `npmPublishRegistry` in
[`.yarnrc.yml`](.yarnrc.yml)).

---

## Trusted publisher setup (one-time, per package)

Each package must have a trusted publisher configured on npm before it can publish
via OIDC. This is scripted — run it as an npm org admin.

> **Prerequisites:** the **latest npm CLI** (`npm trust` requires **npm ≥ 11.10.0**)
> and an authenticated session with account-level 2FA. The script hard-stops with an
> upgrade hint if your npm is too old, so run `npm install -g npm@latest` first.

```bash
npm install -g npm@latest   # npm trust requires npm >= 11.10.0
npm login                   # needs account-level 2FA enabled
yarn release:configure-trust
```

[`scripts/configure-trusted-publishers.mjs`](scripts/configure-trusted-publishers.mjs)
enrolls every publishable workspace for the `knocklabs/javascript` repo, the
`release.yml` workflow, and the `production-release` environment. `npm trust` prompts
for a 2FA OTP (with a 5-minute skip window that covers all packages). This is
intentionally local and interactive — it never runs in CI, so no publish credential
lives there.

---

## Adding a new published package

npm **cannot** publish a brand-new package name via OIDC — the package must already
exist on the registry before a trusted publisher can be configured. So a new package
needs a one-time bootstrap. The `publish` job **fails loudly** with a pointer here if
it meets a package that isn't on npm yet, rather than surfacing a misleading auth
error.

Do this once, locally, as a maintainer with publish rights:

1. **Scaffold the package** under `packages/`. Make sure it is **not** `private`,
   has a valid `repository` field (with `directory`, for provenance), and the
   correct `files`/build setup. Match an existing package like
   [`packages/client`](packages/client/package.json).

2. **Publish the first version manually** — the one step OIDC can't do. From the
   package directory, using a short-lived
   [granular access token](https://docs.npmjs.com/creating-and-viewing-access-tokens)
   or an interactive `npm login` (+ 2FA):

   ```bash
   yarn build:packages
   yarn workspace @knocklabs/<name> npm publish --access public
   ```

   Build first: `yarn npm publish` packs whatever is on disk and runs no build
   scripts, so publishing an unbuilt package would ship a tarball with no `dist/`.

   This is the only place a publish token is ever used, and it stays on your machine
   — never in CI.

3. **Enroll it for trusted publishing** so every future release uses OIDC:

   ```bash
   yarn release:configure-trust
   ```

   (Re-running enrolls the new package alongside the existing ones.)

4. **Release as normal** — add a changeset, merge the Version PR. The new package now
   publishes via OIDC + provenance like every other.

---

## Troubleshooting publishing

- **`publish` job fails at "Pre-flight — all packages enrolled"**: a package being
  released isn't on npm yet. Follow "Adding a new published package" above.
- **`Provenance generation is only supported in GitHub Actions and GitLab CI`**:
  expected locally; provenance only generates in CI where the OIDC token exists.
- **OIDC auth failures in CI**: confirm the package's trusted publisher points at
  `release.yml` / `production-release` (re-run `yarn release:configure-trust`), that
  the run targets `registry.npmjs.org`, and that no `NPM_TOKEN`/`NODE_AUTH_TOKEN` is
  set in the `publish` job (a token present disables OIDC).

---

## Commands Reference

```bash
# Enter prerelease mode
npx changeset pre enter canary  # or rc

# Exit prerelease mode
npx changeset pre exit

# Apply version bumps and changelog updates
npx changeset version

# Publishing is handled by CI via OIDC (yarn npm publish) when a Version PR merges —
# there is no manual publish step. See "How publishing is authenticated" above.
```

> `npx changeset version`: Applies all pending changesets, bumps versions, and updates changelogs.

---

Let an engineer on the team know if you're unsure which type of release is appropriate or if any `.changeset/pre.json` state looks incorrect.

This process ensures stable releases are intentional, pre-releases are safe, and GitHub Actions handles the rest automatically.