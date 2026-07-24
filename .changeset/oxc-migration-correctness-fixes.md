---
"@knocklabs/client": patch
"@knocklabs/react": patch
---

Fix correctness issues surfaced while migrating packages to oxlint:

- `@knocklabs/react`: the guide `Modal`/`Card` image components no longer pass `children` to the void `<img>` element (previously invalid and ignored at runtime).
- `@knocklabs/client`: `KnockGuideActivationUrlPattern.pattern` is now typed against the `urlpattern-polyfill` `URLPattern` it is constructed from, rather than the DOM lib's global `URLPattern`.
