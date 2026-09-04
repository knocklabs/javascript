---
"@knocklabs/react": patch
---

Stop `sortByDisplayName` from reordering the array it is given

The MS Teams comboboxes sorted their teams and channels in place. `useMsTeamsChannels` returns a reference straight into SWR's cache, so rendering `MsTeamsChannelInTeamCombobox` reordered the cached array for every other reader of that key, including apps calling the hook themselves. The helper now copies before sorting, matching its Slack counterpart.
