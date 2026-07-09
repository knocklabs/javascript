---
"@knocklabs/react-core": minor
"@knocklabs/react": minor
"@knocklabs/react-native": minor
"@knocklabs/expo": minor
---

Add `useKnockAuthState()` and make the Slack, MS Teams, and Expo integrations react to authentication changes.

- New `useKnockAuthState(knock)` hook subscribes to a client's authentication state (`{ status, userId, userToken }`), re-rendering on login, logout, or a user switch. Backed by the subscribable `authStore` on `@knocklabs/client`.
- Slack and MS Teams connection status now reset and re-run `authCheck` when the authenticated user changes, instead of latching on the first check. The provider keys now include the userId so a user switch reliably re-renders consumers. Combined with the client-side guards, an unauthenticated user resolves to `disconnected` (never `error`) without a network request.
- Expo: `autoRegister` now waits for an authenticated user before registering a push token — deferring the OS permission prompt (no longer prompting logged-out users) and re-running registration once a user signs in. A notification tapped while logged out no longer fires a message-status update.
