---
"@knocklabs/react": patch
---

Improve accessibility of notification feed components

- The dialog `<div>` rendered by `NotificationFeedPopover` now has an appropriate accessible name.
- Decorative icons are now hidden from the accessibility tree using `aria-hidden`.
