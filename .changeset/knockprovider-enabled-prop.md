---
"@knocklabs/react-core": minor
"@knocklabs/react": minor
"@knocklabs/react-native": minor
"@knocklabs/expo": minor
---

Add an `enabled` prop to `KnockProvider` (and an `enabled` option to `useAuthenticatedKnockClient`).

When `enabled` is `false`, the provider still renders its children but the Knock client sits idle: no identify call, no API requests, no websocket. Set it to `true` and it connects like a login; set it back to `false` and it disconnects and clears its data like a logout. It defaults to `true`, so existing code is unaffected.

Use this instead of conditionally mounting `KnockProvider`, for example to wait for a user token that loads asynchronously:

```tsx
<KnockProvider apiKey={apiKey} user={{ id: userId }} userToken={userToken} enabled={Boolean(userId && userToken)} />
```

Also fixed:

- `useFeedSettings` no longer calls `GET /v1/users/undefined/feeds/.../settings` when there's no user.
- `KnockProvider` now disconnects its client (websocket, token-refresh timer, listener) when it unmounts, instead of leaving them running.
