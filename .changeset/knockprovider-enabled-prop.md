---
"@knocklabs/react-core": minor
"@knocklabs/react": minor
"@knocklabs/react-native": minor
"@knocklabs/expo": minor
---

Add an `enabled` prop to `KnockProvider` (and an `enabled` option to `useAuthenticatedKnockClient`).

When `enabled` is `false`, the provider renders its children but keeps the Knock client **unauthenticated and fully quiescent** — no identify, no network requests, and no real-time socket activity. Flipping it to `true` authenticates and mounts everything (like a login); flipping it back to `false` tears everything down and clears the client's stores (like a logout). It defaults to `true`, so existing usage is unchanged.

This is the recommended replacement for conditionally mounting `KnockProvider`, and the canonical way to defer activity until you have a complete identity — e.g. an enhanced-security user token that loads asynchronously:

```tsx
<KnockProvider
  apiKey={apiKey}
  user={{ id: userId }}
  userToken={userToken}
  enabled={Boolean(userId && userToken)}
>
```

Also fixed while here:

- `useFeedSettings` no longer fires `GET /v1/users/undefined/feeds/.../settings` for an unauthenticated user.
- `KnockProvider` now tears down its Knock client (socket, token-expiration timer, and page-visibility listener) on unmount instead of leaking it.
