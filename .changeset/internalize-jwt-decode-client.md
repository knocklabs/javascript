---
"@knocklabs/client": patch
---

Internalize `jwt-decode` in `@knocklabs/client` and drop the runtime dependency. Token decoding now uses a small inlined decoder, removing the package from consumers' install graphs.
