---
"@knocklabs/react": patch
---

Remove the `clsx` and `lodash.debounce` dependencies. Guide components compose `className` with a small internal `cx` helper, and an internal trailing-edge debounce replaces `lodash.debounce`.
