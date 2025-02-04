---
"@knocklabs/react-core": patch
---

Use SWR in `useConnectedSlackChannels` hook

`useConnectedSlackChannels` now uses [SWR](https://swr.vercel.app/) under the hood. The returned array of connections (`data`) will now update optimistically when `updateConnectedChannels` is called.
