---
"@knocklabs/client": patch
---

Stop the user-token refresh from spinning. The expiry timer is no longer scheduled with a negative delay when the client authenticates with a token that is already inside the refresh window, orphaned timers are cleared instead of left live, and a refresh whose token expires too soon to schedule another wait no longer re-authenticates (which would tear down and rebuild the API client and socket on every round trip).
