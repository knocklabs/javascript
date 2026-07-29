---
"@knocklabs/client": patch
"@knocklabs/react": patch
---

fix(KNO-14505): prevent guide engagement API failures from becoming unhandled promise rejections

Guide seen, interacted, and archived events continue to update local state optimistically while failed background requests are caught and logged. API request errors now retain their original identity, HTTP status, and response data for diagnostics.
