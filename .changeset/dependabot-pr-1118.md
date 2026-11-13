---
"@knocklabs/client": patch
"@knocklabs/react-core": patch
---

chore(deps): bump @tanstack/store from 0.7.2 to 0.11.2 and @tanstack/react-store from 0.7.3 to 0.11.2

`knock.authStore`, `knockGuideClient.store`, and `feedClient.store` keep their existing API: `subscribe()` returns an unsubscribe function, and listeners receive `{ prevVal, currentVal }`.
