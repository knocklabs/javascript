---
"@knocklabs/react": patch
---

Internalize `lodash.debounce` in `@knocklabs/react` with a small trailing-edge debounce util and drop the `lodash.debounce` runtime dependency (and its `@types/lodash.debounce` dev dependency).
