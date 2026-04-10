# Slack OAuth CSRF Nonce Diagnosis

## Problem

A customer using a headless implementation of `useSlackAuth` was flagged during Slack's app review process for missing CSRF protection (nonce) in the `state` parameter of their OAuth URL. Investigation confirmed two issues:

1. **No nonce is generated.** `buildSlackAuthUrl()` in `useSlackAuth.ts:85-111` constructs the `state` parameter with only data-passing fields (redirect_url, access_token_object, channel_id, public_key, user_token, branch_slug). There is no random, session-bound nonce for CSRF protection.

2. **Even if a customer added a nonce, they couldn't verify it.** The `state` parameter is fully consumed by the Knock API at `/providers/slack/authenticate`. The `postMessage` sent back to the client is a bare string (`"authComplete"` or `"authFailed"`) — it carries no data from the original state, so the nonce is lost.

This affects **both the `SlackAuthButton` component and headless `useSlackAuth` users**, and the identical pattern exists in `useMsTeamsAuth.ts:34-50` for MS Teams.

---

## Current OAuth Flow

```
1. SDK (useSlackAuth.buildSlackAuthUrl) → builds URL with state = JSON of
   {redirect_url, access_token_object, channel_id, public_key, user_token, branch_slug}
2. User authorizes in Slack popup
3. Slack redirects to api.knock.app/providers/slack/authenticate?code=...&state=...
4. Knock API consumes state, exchanges code for token, stores it
5. Knock API sends postMessage("authComplete") back to the parent window
6. SDK (useAuthPostMessageListener) receives "authComplete" string → sets status to "connected"
   OR: SDK (useAuthPolling) polls authCheck endpoint every 2s → detects success
```

### Key Files (SDK)

| File | Role |
|------|------|
| `packages/react-core/src/modules/slack/hooks/useSlackAuth.ts` | Builds auth URL with `state`, handles disconnect |
| `packages/react-core/src/modules/ms-teams/hooks/useMsTeamsAuth.ts` | Same pattern for MS Teams |
| `packages/react-core/src/modules/core/hooks/useAuthPostMessageListener.ts` | Listens for postMessage from OAuth popup, validates origin |
| `packages/react-core/src/modules/core/hooks/useAuthPolling.ts` | Fallback polling (every 2s, up to 3 min) |
| `packages/react-core/src/modules/slack/context/KnockSlackProvider.tsx` | Context provider managing popup ref and connection status |
| `packages/react/src/modules/slack/components/SlackAuthButton/SlackAuthButton.tsx` | Button component that opens popup, wires up listener + polling |
| `packages/react/src/modules/ms-teams/components/MsTeamsAuthButton/MsTeamsAuthButton.tsx` | Same for MS Teams |

### Key Endpoint (API)

| Endpoint | Repo |
|----------|------|
| `/providers/slack/authenticate` | [switchboard](https://github.com/knocklabs/switchboard/blob/b50704b460e62229ea5c9c66d14ed82f0a3bb326/lib/switchboard_web/router.ex#L327) |

---

## Recommended Changes

### 1. SDK Changes (this repo)

#### A. Generate and store a nonce in `useSlackAuth.ts`

```typescript
// In buildSlackAuthUrl callback:
const nonce = crypto.randomUUID();
sessionStorage.setItem(`knock:slack-auth-nonce:${knockSlackChannelId}`, nonce);

const rawParams = {
  state: JSON.stringify({
    nonce,                    // <-- NEW
    redirect_url: redirectUrl,
    access_token_object: { ... },
    channel_id: knockSlackChannelId,
    public_key: knock.apiKey,
    user_token: knock.userToken,
    branch_slug: knock.branch,
  }),
  client_id: slackClientId,
  scope: combinedScopes.join(","),
};
```

Same change in `useMsTeamsAuth.ts`.

#### B. Update `useAuthPostMessageListener.ts` to verify the nonce

The postMessage data format needs to change from a bare string to a structured object. The listener should:

```typescript
const receiveMessage = (event: MessageEvent) => {
  if (event.origin !== knockHost) return;

  // Support both old format (string) and new format (object with nonce)
  const messageType = typeof event.data === "string"
    ? event.data
    : event.data?.type;
  const returnedNonce = typeof event.data === "object"
    ? event.data?.nonce
    : undefined;

  if (messageType === "authComplete") {
    // Verify nonce if one was stored (and one was returned)
    if (returnedNonce !== undefined) {
      const storedNonce = sessionStorage.getItem(`knock:${provider}-auth-nonce:${channelId}`);
      if (storedNonce && storedNonce !== returnedNonce) {
        setConnectionStatus("error");
        return;
      }
      sessionStorage.removeItem(`knock:${provider}-auth-nonce:${channelId}`);
    }

    setConnectionStatus("connected");
    onAuthenticationComplete?.(messageType);
    // ... close popup
  }
};
```

The listener needs to accept a `channelId` (or sessionStorage key) so it knows which nonce to look up. This means updating `UseAuthPostMessageListenerOptions` to include the relevant context.

#### C. Expose the nonce for headless users

For customers using `useSlackAuth` headlessly (not using `SlackAuthButton` or the postMessage listener), they need to be able to access the nonce to verify it themselves. Two options:

- **Option 1**: Return it from `buildSlackAuthUrl` — change the return type from `string` to `{ url: string; nonce: string }` (breaking change)
- **Option 2** (recommended): Keep `buildSlackAuthUrl` returning a string, but add a separate `getAuthNonce()` function to the hook's return value, or document that customers can read it from `sessionStorage` at the known key

#### D. Polling path (`useAuthPolling.ts`)

The polling mechanism independently checks auth status via `authCheck()` — it doesn't go through the OAuth redirect. It doesn't need nonce verification directly, since it's just checking "did the token get stored?" However, we could optionally verify the nonce through the authCheck response if the API returns it.

### 2. API Changes (switchboard repo)

#### A. `/providers/slack/authenticate` — echo the nonce in postMessage

This is the critical API change. The endpoint currently sends:

```javascript
postMessage("authComplete", "*")  // or "authFailed"
```

It needs to change to:

```javascript
// Extract nonce from the state parameter
const state = JSON.parse(params["state"])
const nonce = state["nonce"]

// Send structured data instead of bare string
postMessage({ type: "authComplete", nonce: nonce }, redirect_origin)
```

This must be backward compatible: if no nonce is in the state, send the old format or send `{ type: "authComplete" }` with no nonce field. The SDK's updated listener handles both formats.

#### B. Same change for `/providers/ms-teams/authenticate`

The MS Teams callback endpoint needs the identical treatment.

#### C. Tighten postMessage target origin (optional but recommended)

If the API is currently using `"*"` as the target origin for `postMessage`, it should be tightened to the `redirect_url` origin from the state parameter. This prevents the auth result from being intercepted by other windows.

---

## Summary of Changes by File

| File | Repo | Change |
|------|------|--------|
| `react-core/.../useSlackAuth.ts` | SDK | Generate nonce, store in sessionStorage, include in state |
| `react-core/.../useMsTeamsAuth.ts` | SDK | Same as above |
| `react-core/.../useAuthPostMessageListener.ts` | SDK | Accept structured postMessage, verify nonce against sessionStorage |
| `react/.../SlackAuthButton.tsx` | SDK | Pass channelId to postMessage listener for nonce lookup |
| `react/.../MsTeamsAuthButton.tsx` | SDK | Same as above |
| `switchboard/.../slack/authenticate` | API | Extract nonce from state, include in postMessage response |
| `switchboard/.../ms-teams/authenticate` | API | Same as above |
| Tests for all above | Both | Update to cover nonce generation, verification, and backward compat |

---

## Migration / Backward Compatibility

The recommended rollout order:

1. **Ship SDK first** with nonce generation + listener that accepts both string and object postMessage formats
2. **Ship API second** with nonce echo in postMessage (using object format)
3. Eventually deprecate string-only format

- The SDK change is backward compatible: it adds a nonce to state, but old API versions that ignore unknown state fields won't break.
- The API change requires care: sending structured postMessage data means old SDK versions that check `event.data === "authComplete"` will fail — so the API should also keep sending the string format during a transition period, or the SDK should be released first with support for both formats.
