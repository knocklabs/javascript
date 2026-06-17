---
"@knocklabs/react-core": patch
---

Internalize `fast-deep-equal` in `@knocklabs/react-core` with a small inlined deep-equality util and drop the runtime dependency, removing it from consumers' install graphs.
