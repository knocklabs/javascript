---
"@knocklabs/react": patch
---

Use SWR to update connected channels in `SlackChannelCombobox`

`SlackChannelCombobox` now uses [SWR](https://swr.vercel.app/) to retrieve and update connected Slack channels. There should be no change in the behavior of this component.
