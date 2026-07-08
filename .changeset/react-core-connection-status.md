---
"@knocklabs/react-core": patch
---

Keep Slack and MS Teams connection-status detection working with the new fetch-based `@knocklabs/client` transport by reading the HTTP response status instead of the previous axios-specific error `code`. The exported `AuthCheckResult` type no longer includes `code` and now exposes `response.status`.
