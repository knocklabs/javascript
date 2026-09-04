---
"@knocklabs/react": patch
---

Keep the channel-type icon on Slack combobox options

`@telegraph/combobox` renders an option as `label || children || value`, so giving an option a string `label` for its accessible name stops its children rendering. The hash/lock icon now comes through the option's trailing icon slot, since the leading slot belongs to the selection check.
