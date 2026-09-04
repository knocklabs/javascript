---
"@knocklabs/react": patch
---

Name the Slack channel combobox trigger without changing what it renders

The trigger announced the raw Slack channel id, because an option's accessible name is derived from its children and these render an icon beside the name. The component now passes its own `aria-label`, which the trigger spreads over the one it derives, so the channel icon and the layout stay exactly as they were.
