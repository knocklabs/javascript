---
"@knocklabs/client": minor
---

Add a subscribable authentication-state signal and make the client fully quiescent while unauthenticated. This is the `@knocklabs/client` foundation for an upcoming `enabled` prop on `KnockProvider`.

- `Knock` now exposes a subscribable `authStore` (a `@tanstack/store`) and an `authStatus` getter (`"authenticated" | "unauthenticated"`), updated on every `authenticate()` and `logout()`.
- New `Knock.logout()` clears credentials and tears down all stateful connections (feed channels, socket, token-expiration timer, and page-visibility listener), then lazily recreates the API client on next use. Re-authenticating after a logout rewires any surviving feed instances.
- Unauthenticated calls are now quiet no-ops instead of firing requests or throwing:
  - Feed `markAs*` / `markAll*` / `fetchNextPage` skip the network **and** the optimistic store update.
  - Guide `fetch()` / `subscribe()` and step `markAsSeen` / `markAsInteracted` / `markAsArchived` no longer throw (`fetch()` resolves to an error status). This fixes a crash when Guides render before a user is authenticated.
  - Slack and MS Teams `authCheck` return a disconnected result, and `getChannels` / `getTeams` return empty results.
  - `messages.batchUpdateStatuses` returns an empty array.
- Fix: the guide client now re-reads its socket from the API client on each `subscribe()`, so guide real-time keeps working after a re-authentication (previously it captured the socket once at construction and went stale on user/token changes).
- Fix: the guide client's `history.pushState`/`replaceState` monkey-patch is now shared and idempotent per window, so remounting a guide provider (e.g. toggling `enabled`) no longer nests patches or leaves the originals unrestored.
