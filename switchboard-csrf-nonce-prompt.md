# Switchboard: Add CSRF Nonce to Slack OAuth Callback

## Context

Our JavaScript SDK (`@knocklabs/react-core`) builds OAuth authorization URLs for Slack that include a `state` parameter. This `state` is a JSON-encoded object used to pass data through the OAuth flow:

```json
{
  "redirect_url": "https://customer-app.com/callback",
  "access_token_object": { "object_id": "tenant_123", "collection": "$tenants" },
  "channel_id": "knock_channel_abc",
  "public_key": "pk_test_...",
  "user_token": "jwt_...",
  "branch_slug": "production"
}
```

Slack's app review process now requires a CSRF-preventing nonce in the `state` parameter. We are updating the SDK to generate a random `nonce` field and include it in the `state` JSON. The SDK stores this nonce in `sessionStorage` so it can verify it when the auth flow completes.

However, the OAuth callback endpoint in Switchboard (`/providers/slack/authenticate`) consumes the `state` parameter server-side and communicates the result back to the client via `postMessage`. Currently the `postMessage` sends a bare string (`"authComplete"` or `"authFailed"`), which means the nonce is lost and the client can never verify it.

**We need Switchboard to echo the nonce back to the client in the `postMessage` payload.**

## What to Change

### 1. Slack OAuth callback — `/providers/slack/authenticate`

Reference: `lib/switchboard_web/router.ex` line 327 and whatever controller/handler it routes to.

When processing the OAuth callback:

1. Parse the `state` JSON from the query params (you likely already do this to extract `redirect_url`, `access_token_object`, etc.)
2. Extract the `nonce` field from the parsed state (it may not be present — old SDK versions won't send it)
3. When sending the `postMessage` back to the parent window, change the data format from a bare string to a structured object that includes the nonce:

**Before:**
```javascript
window.opener.postMessage("authComplete", "*");
// or
window.opener.postMessage("authFailed", "*");
```

**After:**
```javascript
window.opener.postMessage({ type: "authComplete", nonce: "<nonce_from_state>" }, "<redirect_origin>");
// or
window.opener.postMessage({ type: "authFailed", nonce: "<nonce_from_state>" }, "<redirect_origin>");
```

If the `nonce` field is not present in the state (backward compat with old SDK versions), omit it from the payload or set it to `null`:
```javascript
window.opener.postMessage({ type: "authComplete", nonce: null }, "<redirect_origin>");
```

### 2. Tighten `postMessage` target origin (recommended)

If the `postMessage` calls currently use `"*"` as the target origin, tighten them to use the origin derived from the `redirect_url` in the state parameter. For example, if `redirect_url` is `https://customer-app.com/callback`, the target origin should be `https://customer-app.com`. This prevents the auth result from being interceptable by unrelated windows.

If `redirect_url` is missing or unparseable, fall back to `"*"`.

## Backward Compatibility

- **Old SDK + new API**: The SDK currently checks `event.data === "authComplete"`. Sending `{ type: "authComplete", nonce: ... }` will break this check. The updated SDK (shipping first) will handle both formats. During the transition period where old SDK versions are still in the wild, consider one of:
  - **(a)** Accept that old SDK versions will break on this change (they'll fall back to the polling mechanism, which still works independently — so auth will still succeed, just not via the faster postMessage path)
  - **(b)** Send both formats: `postMessage("authComplete", ...)` followed by `postMessage({ type: "authComplete", nonce }, ...)` — the old SDK picks up the first, the new SDK picks up the second. This is the safest approach for a smooth rollout.
- **New SDK + old API**: The updated SDK will accept both bare strings and structured objects. If the API hasn't been updated yet, the SDK still works — it just can't verify the nonce (which is fine, it degrades gracefully).

**Recommendation: use approach (b)** — send both formats — to avoid any disruption for customers on older SDK versions.

## Testing

- Verify that a Slack OAuth flow with the new SDK sends a `nonce` in the state and receives it back in the `postMessage` payload
- Verify that a Slack OAuth flow with an old SDK (no `nonce` in state) still works correctly (postMessage sends `nonce: null`)
- Verify that the `authFailed` path also includes the nonce
- If tightening the target origin: verify `postMessage` is received correctly when `redirect_url` is present, and that the `"*"` fallback works when it's absent
