---
"@knocklabs/react": patch
---

Update `@telegraph/*` dependencies to use `>=current_version` ranges instead of `^` (caret) ranges. This ensures that any version of a `@telegraph/*` package installed by a downstream project will satisfy `@knocklabs/react`'s dependency range, preventing Yarn from installing duplicate copies of Telegraph packages.
