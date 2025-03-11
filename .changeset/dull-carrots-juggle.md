---
"@knocklabs/react-core": patch
---

Fix unnecessary refetches of first page by `useSlackChannels` and `useMsTeamsTeams` hooks

Previously, both the `useSlackChannels` and `useMsTeamsTeams` hooks would unnecessarily refetch the first page of data whenever multiple pages of data were loaded. This has been fixed.
