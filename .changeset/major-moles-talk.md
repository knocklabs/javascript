---
"@knocklabs/client": patch
---

Allow multiple instances of `Feed` to listen for real-time updates to the same notification feed

Previously, using two or more instances of `Feed` with the same in-app feed channel would result in
only the most recently connected `Feed` receiving real-time updates. Now, all instances of `Feed`
configured with the same in-app channel will receive real-time updates.
