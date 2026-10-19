---
"@knocklabs/client": patch
---

Skip socket instantiation when WebSocket transport is unavailable

Previously, in environments where `window` is defined but `WebSocket` is not supported, `ApiClient` would attempt to set up a socket but always encounter an error. Now, the socket will never be instantiated when `WebSocket` is unavailable.
