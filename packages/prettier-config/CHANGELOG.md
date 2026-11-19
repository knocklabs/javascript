# @knocklabs/prettier-config

## 0.0.3

### Patch Changes

- dcb80b7: Patch the minimatch 9.0.9 copy flagged by Vanta. `minimatch@^9.0.0`, `^9.0.3`, and `^9.0.4` now resolve to 11.0.8, and `node-gyp@latest` now resolves to 13.1.0, which drops `glob@10`.

## 0.0.2

### Patch Changes

- 8968d01: Publish from GitHub Actions through npm trusted publishing (OIDC) with signed provenance, and point each package's `repository` field at its directory in this repo.

## 0.0.1

### Patch Changes

- 59185ce: creates prettier config package
