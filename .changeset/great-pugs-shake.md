---
"@knocklabs/react": patch
---

Pin `@telegraph/combobox` to `^0.6.0` and fix the Slack channel combobox's accessible name

`@knocklabs/react` declared `@telegraph/combobox: ">=0.5.0"`, so consumers resolved to whatever the latest release was. The range is now a caret range, and the package is upgraded to 0.6.0.

`SlackChannelCombobox` renders an icon beside each channel name, so its options have element children. In 0.6.0 an option's accessible name falls back to its `value` when the label is not a string, which made the trigger announce the raw Slack channel id instead of the channel name. Each option now passes an explicit `label`.
