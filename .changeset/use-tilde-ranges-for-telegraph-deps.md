---
"@knocklabs/react": patch
---

Update `@telegraph/*` dependencies to use `~` (tilde) ranges instead of `^` (caret) ranges. This allows patch-level updates while requiring explicit updates for minor version bumps, preventing duplicate installs in applications that also depend on `@telegraph/*` packages directly.
