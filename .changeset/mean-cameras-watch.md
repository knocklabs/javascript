---
"@knocklabs/react-core": patch
---

Dispose of feed on unmount in `useNotifications` hook

Previously, the `useNotifications` hook did not clean up old instances of `Feed`
on unmount. This has been fixed.
