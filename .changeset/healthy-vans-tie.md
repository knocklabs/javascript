---
"@knocklabs/react": minor
---

Update design of `SlackChannelCombobox`

We've given SlackKit a facelift!

With this release, we've redone the user interface of SlackKit's `SlackChannelCombobox` component so that it uses [Telegraph](https://github.com/knocklabs/telegraph), Knock's design system. These changes improve its accessibility and make it visually consistent with TeamsKit's `MsTeamsChannelCombobox`. **We recommend manually testing this update to verify this improved version of `SlackChannelCombobox` looks as expected in your application's user interface.**

In addition, we've removed the following props from `SlackChannelCombobox`:

- `showConnectedChannelTags` (`SlackChannelCombobox` now automatically shows connected channels within the combobox itself.)
- `inputProps`
- `inputContainerProps`
- `listBoxProps`
- `channelOptionProps`
