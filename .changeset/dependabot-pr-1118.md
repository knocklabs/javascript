---
"@knocklabs/client": patch
"@knocklabs/react-core": patch
---

chore(deps): bump @tanstack/store from 0.7.2 to 0.11.2 and @tanstack/react-store from 0.7.3 to 0.11.2

- `knock.authStore.subscribe()` and `knockGuideClient.store.subscribe()` now return a `{ unsubscribe }` object instead of an unsubscribe function, and the listener receives the new state rather than `{ prevVal, currentVal }`.
- `feedClient.store.subscribe()` still returns an unsubscribe function.
- `useStore` from `@knocklabs/react-core` still compares selected values with `shallow` by default. `@tanstack/react-store` 0.9 changed its default to `===`.
