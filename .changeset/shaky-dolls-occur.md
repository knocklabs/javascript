---
"@knocklabs/react-core": patch
---

fix: make the user prop to KnockProvider stable by comparing equality, and prevent re-instantiating the knock client unnecessarily
