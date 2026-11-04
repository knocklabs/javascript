---
"@knocklabs/client": minor
"@knocklabs/expo": minor
"@knocklabs/react": minor
"@knocklabs/react-core": minor
"@knocklabs/react-native": minor
---

Make request to `POST /v1/sockets/connect` before connecting WebSocket

The Knock API client now makes a request to the `POST /v1/sockets/connect` endpoint of the Knock API before establishing a WebSocket connection. This applies to both feeds and guides, which rely on WebSockets for real-time messages.

