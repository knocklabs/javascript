---
"@knocklabs/react-core": patch
---

Fix auth button cross-contamination when SlackKit and TeamsKit are rendered simultaneously. The shared `useAuthPostMessageListener` hook now checks whether its own popup is open before processing `authComplete` messages, preventing one integration's OAuth completion from incorrectly updating the other's connection state.
