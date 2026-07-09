---
"@knocklabs/client": patch
---

fix(KNO-13857): reduce websocket reconnect load when connections can't recover

The Phoenix socket now escalates its reconnect backoff toward a 10-minute cap (previously a fixed 30s cap that Phoenix reset on every successful open), so a client that can never reconnect — for example after an API key rotation leaves stale credentials that get rejected on every upgrade — settles into a slow retry cadence instead of a tight loop. Backoff escalation persists through brief "connect then immediately drop" cycles and resets once a connection stays up for 30s.

Additionally:

- `teardown()` now always disconnects the socket (even mid-reconnect), so a reauth that replaces the client can't leak a socket that keeps retrying with stale credentials.
- Hidden background tabs now stop retrying: a socket that is mid-reconnect when the page is hidden is disconnected, not just connected ones, and resumes when the page becomes visible again.
- Reconnects promptly on the browser `online` event so recovery after a real network drop doesn't wait out the (now longer) backoff.
