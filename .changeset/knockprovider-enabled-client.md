---
"@knocklabs/client": minor
---

Make the client do nothing (instead of throwing or making requests) when there's no signed-in user, and add tools to manage sign-in state.

- New `Knock.logout()` clears the user and disconnects everything: the websocket, the token-refresh timer, and the page-visibility listener.
- New `knock.authStatus` (`"authenticated"` or `"unauthenticated"`) and a subscribable `knock.authStore` to check or react to whether a user is signed in.
- With no signed-in user, these now do nothing instead of throwing or calling the API:
  - Feed `markAs*` / `markAll*` / `fetchNextPage` (they also skip the optimistic UI update).
  - Guides `fetch` / `subscribe` and the step actions. These previously threw, which could crash the app when Guides rendered before a user was set.
  - Slack/MS Teams `authCheck` (returns "not connected"), `getChannels` / `getTeams` (return empty), and `messages.batchUpdateStatuses` (returns `[]`).
- Fixes two Guide bugs: real-time updates broke after a re-login (a stale socket reference), and the `history` patch used for location tracking broke when a Guide provider remounted.
