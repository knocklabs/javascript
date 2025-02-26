---
"@knocklabs/react": patch
---

Make `SlackChannelCombobox` and `MsTeamsChannelCombobox` non-modal

This fixes a bug whereby the page layout could shift when the combobox dropdown menu opens and the `<body>` element has non-zero padding.
