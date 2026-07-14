---
"@knocklabs/expo": patch
---

Fix Expo push auto-registration not re-running when the signed-in user changes in place. The auto-register effect now depends on the authenticated `userId`, so switching users on the same `KnockProvider` (where `isAuthenticated` never flips) re-registers the device token against the new user's channel data.
