---
"@knocklabs/react-core": minor
"@knocklabs/react": minor
"@knocklabs/react-native": minor
"@knocklabs/expo": minor
---

Add `useKnockAuthState()` and make Slack, MS Teams, and Expo respond to sign-in changes.

- New `useKnockAuthState(knock)` hook re-renders when the user signs in, signs out, or switches.
- Slack and MS Teams connection status now re-checks when the user changes, instead of checking once and sticking with that result.
- Expo waits for a signed-in user before registering for push notifications, so logged-out users don't see the OS permission prompt. A notification tapped while logged out no longer tries to update its status.
