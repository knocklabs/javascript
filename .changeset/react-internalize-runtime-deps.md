---
"@knocklabs/react": patch
---

Remove the `clsx` and `lodash.debounce` dependencies. Guide components now compose `className` natively, and an internal trailing-edge debounce replaces `lodash.debounce`.
