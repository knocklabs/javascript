# Changelog

## 0.7.2

### Patch Changes

- Updated dependencies [00439a2]
  - @knocklabs/client@0.14.2
  - @knocklabs/react-core@0.6.2

## 0.7.1

### Patch Changes

- Updated dependencies [4c41841]
  - @knocklabs/client@0.14.1
  - @knocklabs/react-core@0.6.1

## 0.7.0

### Minor Changes

- 711948c: feat: add guide client, hooks, provider, and components

### Patch Changes

- Updated dependencies [711948c]
  - @knocklabs/react-core@0.6.0
  - @knocklabs/client@0.14.0

## 0.6.2

### Patch Changes

- Updated dependencies [187abc1]
  - @knocklabs/client@0.13.1
  - @knocklabs/react-core@0.5.2

## 0.6.1

### Patch Changes

- Updated dependencies [4cd1b1e]
  - @knocklabs/client@0.13.0
  - @knocklabs/react-core@0.5.1

## 0.6.0

### Minor Changes

- 8ba5dcb: [JS] Support React 19 in React SDKs

### Patch Changes

- Updated dependencies [8ba5dcb]
  - @knocklabs/client@0.12.0
  - @knocklabs/react-core@0.5.0

## 0.5.2

### Patch Changes

- Updated dependencies [226e319]
  - @knocklabs/react-core@0.4.2

## 0.5.1

### Patch Changes

- 9e638a2: Make `SlackChannelCombobox` and `MsTeamsChannelCombobox` non-modal

  This fixes a bug whereby the page layout could shift when the combobox dropdown menu opens and the `<body>` element has non-zero padding.

- Updated dependencies [1b86a0c]
  - @knocklabs/react-core@0.4.1

## 0.5.0

### Minor Changes

- 7904b65: Update design of `SlackChannelCombobox`

  We've given SlackKit a facelift! 🎉

  With this release, we've redone the user interface of SlackKit's `SlackChannelCombobox` component so that it uses [Telegraph](https://github.com/knocklabs/telegraph), Knock's design system. These changes improve its accessibility and make it visually consistent with TeamsKit's `MsTeamsChannelCombobox`. **We recommend manually testing this update to verify this improved version of `SlackChannelCombobox` looks as expected in your application's user interface.**

  In addition, we've removed the following props from `SlackChannelCombobox`:

  - `showConnectedChannelTags` (`SlackChannelCombobox` now automatically shows connected channels within the combobox itself.)
  - `inputProps`
  - `inputContainerProps`
  - `listBoxProps`
  - `channelOptionProps`

  The `inputMessages` prop has also been updated to remove the `singleChannelConnected` and `multipleChannelsConnected` strings.

### Patch Changes

- Updated dependencies [7904b65]
  - @knocklabs/react-core@0.4.0

## 0.4.2

### Patch Changes

- 68f2c5c: Fix a11y issues caught by eslint-plugin-jsx-a11y
- 96872de: Update Telegraph dependencies
- 33c5cd8: Update Telegraph dependencies
- 5d674c3: Update label of channel picker in `MsTeamsChannelCombobox`

  The label now says "Channels" rather than "Channel".

- Updated dependencies [8ea25f4]
  - @knocklabs/client@0.11.4
  - @knocklabs/react-core@0.3.4

## 0.4.1

### Patch Changes

- 12bc993: Use SWR to update connected channels in `SlackChannelCombobox`

  `SlackChannelCombobox` now uses [SWR](https://swr.vercel.app/) to retrieve and update connected Slack channels. There should be no change in the behavior of this component.

- b61c92b: Improve accessibility of notification feed components

  - The dialog `<div>` rendered by `NotificationFeedPopover` now has an appropriate accessible name.
  - Decorative icons are now hidden from the accessibility tree using `aria-hidden`.

- Updated dependencies [12bc993]
- Updated dependencies [4f76cd6]
  - @knocklabs/react-core@0.3.3
  - @knocklabs/client@0.11.3

## 0.4.0

### Minor Changes

- 2161d3f: Add `MsTeamsChannelCombobox` component to allow connecting Microsoft Teams channels to a Knock object

### Patch Changes

- 1ba1393: add TeamsKit hooks for teams and channels
- Updated dependencies [85418a0]
- Updated dependencies [2161d3f]
- Updated dependencies [8cc9338]
- Updated dependencies [da84a75]
- Updated dependencies [2161d3f]
- Updated dependencies [2161d3f]
- Updated dependencies [1ba1393]
- Updated dependencies [b4b5c02]
  - @knocklabs/react-core@0.3.2
  - @knocklabs/client@0.11.2

## 0.3.1

### Patch Changes

- Updated dependencies [b9f6712]
  - @knocklabs/react-core@0.3.1
  - @knocklabs/client@0.11.1

## 0.3.0

### Minor Changes

- 013ad8d: feat: add MsTeamsAuthButton

### Patch Changes

- Updated dependencies [013ad8d]
  - @knocklabs/react-core@0.3.0
  - @knocklabs/client@0.11.0

## 0.2.33

### Patch Changes

- Updated dependencies [26db496]
- Updated dependencies [988aaf9]
  - @knocklabs/client@0.10.17
  - @knocklabs/react-core@0.2.29

## 0.2.32

### Patch Changes

- Updated dependencies [bc99374]
  - @knocklabs/client@0.10.16
  - @knocklabs/react-core@0.2.28

## 0.2.31

### Patch Changes

- Updated dependencies [26166e3]
  - @knocklabs/client@0.10.15
  - @knocklabs/react-core@0.2.27

## 0.2.30

### Patch Changes

- e8dfae8: Pin Radix dependencies to support React 16

## 0.2.29

### Patch Changes

- Updated dependencies [7510909]
  - @knocklabs/client@0.10.14
  - @knocklabs/react-core@0.2.26

## 0.2.28

### Patch Changes

- 47a88da: feature: allow passing additional OAuth scope to SlackAuthButton
- Updated dependencies [47a88da]
  - @knocklabs/react-core@0.2.25

## 0.2.27

### Patch Changes

- 9b91c18: fix: add label to notification filter select
- Updated dependencies [1d440f7]
  - @knocklabs/client@0.10.13
  - @knocklabs/react-core@0.2.24

## 0.2.26

### Patch Changes

- 5545f9e: feat: support passing metadata for interactions
- Updated dependencies [5545f9e]
  - @knocklabs/client@0.10.12
  - @knocklabs/react-core@0.2.23

## 0.2.25

### Patch Changes

- c97661a: fix: wrap long, unbroken text in notification cell

## 0.2.24

### Patch Changes

- Updated dependencies [395f0ca]
  - @knocklabs/client@0.10.11
  - @knocklabs/react-core@0.2.22

## 0.2.23

### Patch Changes

- a4d520c: chore: update generic types
- e88c1c0: remove stop propogation from useComponentVisible hook to prevent page reloads with react-router-dom
- Updated dependencies [a4d520c]
  - @knocklabs/react-core@0.2.21
  - @knocklabs/client@0.10.10

## 0.2.22

### Patch Changes

- Updated dependencies [d0adb14]
  - @knocklabs/client@0.10.9
  - @knocklabs/react-core@0.2.20

## 0.2.21

### Patch Changes

- Updated dependencies [1e60c19]
  - @knocklabs/react-core@0.2.19

## 0.2.20

### Patch Changes

- 29e3942: fix: introduce new useNotificationStore hook to prevent issues that prevent state updates
- Updated dependencies [29e3942]
  - @knocklabs/react-core@0.2.18
  - @knocklabs/client@0.10.8

## 0.2.19

### Patch Changes

- Updated dependencies [f25b112]
  - @knocklabs/react-core@0.2.17
  - @knocklabs/client@0.10.7

## 0.2.18

### Patch Changes

- Updated dependencies [5d2ddab]
  - @knocklabs/react-core@0.2.16

## 0.2.17

### Patch Changes

- b29a47a: Add KnockExpoPushNotificationProvider to react-native sdk
- Updated dependencies [b29a47a]
  - @knocklabs/react-core@0.2.15
  - @knocklabs/client@0.10.6

## 0.2.16

### Patch Changes

- Updated dependencies [5fe3063]
  - @knocklabs/react-core@0.2.14

## 0.2.15

### Patch Changes

- Updated dependencies [044eb0f]
  - @knocklabs/client@0.10.5
  - @knocklabs/react-core@0.2.13

## 0.2.14

### Patch Changes

- Updated dependencies [5a7c56e]
  - @knocklabs/client@0.10.4
  - @knocklabs/react-core@0.2.12

## 0.2.13

### Patch Changes

- Updated dependencies [a71ce51]
  - @knocklabs/client@0.10.3
  - @knocklabs/react-core@0.2.11

## 0.2.12

### Patch Changes

- b8b3fc9: fix: don't use propswithchildren w/o props

## 0.2.11

### Patch Changes

- 42ba22c: fix: improve typing for react < 18
- Updated dependencies [42ba22c]
  - @knocklabs/react-core@0.2.10
  - @knocklabs/client@0.10.2

## 0.2.10

### Patch Changes

- 3288352: chore: add generic type to RenderItemProps to pass to FeedItem

## 0.2.9

### Patch Changes

- 354dd1a: fix: move away from jsx runtime to support react 16 + 17
- Updated dependencies [354dd1a]
  - @knocklabs/react-core@0.2.9

## 0.2.8

### Patch Changes

- 3c277cb: fix: remove react-query and replace with swr for react 16+ support
- 0e4bd20: fix: remove unused dependencies
- Updated dependencies [3c277cb]
- Updated dependencies [567e24f]
  - @knocklabs/react-core@0.2.8
  - @knocklabs/client@0.10.1

## 0.2.7

### Patch Changes

- Updated dependencies [8bdc75b]
  - @knocklabs/client@0.10.0
  - @knocklabs/react-core@0.2.7

## 0.2.6

### Patch Changes

- Updated dependencies [f58371c]
  - @knocklabs/client@0.9.4
  - @knocklabs/react-core@0.2.6

## 0.2.5

### Patch Changes

- Updated dependencies [10b5646]
  - @knocklabs/react-core@0.2.5

## 0.2.4

### Patch Changes

- Updated dependencies [bc69618]
  - @knocklabs/react-core@0.2.4
  - @knocklabs/client@0.9.3

## 0.2.3

### Patch Changes

- fed0f8c: add support for actions in notification feed cells
- Updated dependencies [fed0f8c]
  - @knocklabs/client@0.9.2
  - @knocklabs/react-core@0.2.3

## 0.2.2

### Patch Changes

- Updated dependencies [282d005]
  - @knocklabs/react-core@0.2.2

## 0.2.1

### Patch Changes

- 16ff6b4: Adds an onAuthenticationComplete callback to the SlackAuthButton component and to the example apps.
- 05826b3: Add optional connected channel list to SlackChannelCombobox + to example apps.
- 094fb39: Make the SlackCombobox background opaque so that elements underneath aren't visible when it's popped out.
- Updated dependencies [f37d680]
  - @knocklabs/client@0.9.1
  - @knocklabs/react-core@0.2.1

## 0.2.0

### Minor Changes

- 627e643: Add SlackKit components, hooks, client JS functions, and example apps.

### Patch Changes

- e076109: Fix hover state for connect button.
- Updated dependencies [e076109]
- Updated dependencies [627e643]
  - @knocklabs/react-core@0.2.0
  - @knocklabs/client@0.9.0

## 0.1.9

### Patch Changes

- c9faba5: fix esm build issues with mjs files
- Updated dependencies [c9faba5]
  - @knocklabs/react-core@0.1.6
  - @knocklabs/client@0.8.21

## 0.1.8

### Patch Changes

- Re-releasing packages
- Updated dependencies
  - @knocklabs/client@0.8.20
  - @knocklabs/react-core@0.1.5

## 0.1.7

### Patch Changes

- 9dd0d15: chore: update dependencies
- 7786ec5: chore: upgrade to yarn modern and update local package references
- 9dd0d15: feat: add onUserTokenExpiring callback option to client
- Updated dependencies [7786ec5]
- Updated dependencies [9dd0d15]
  - @knocklabs/react-core@0.1.4
  - @knocklabs/client@0.8.19

## 0.1.6

### Patch Changes

- 59ce044: fix: build process causing esm issues

## 0.1.5

### Patch Changes

- 1050660: feat: switch timestamp formatting to date-fns intlFormatDistance
- Updated dependencies [e53c200]
- Updated dependencies [1050660]
- Updated dependencies [d4ba1f2]
  - @knocklabs/client@0.8.18
  - @knocklabs/react-core@0.1.3

## 0.1.4

### Patch Changes

- 4c16762: fix: update popperjs dependency

## 0.1.3

### Patch Changes

- 4673d95: fix: scope feed provider styles to only Knock elements
- Updated dependencies [7bc5e4a]
  - @knocklabs/client@0.8.16

## 0.1.2

### Patch Changes

- 8988230: Fix esm exports and date-fns/locale imports
- 8315372: Fix cjs build output for React components
- Updated dependencies [8988230]
- Updated dependencies [8315372]
  - @knocklabs/react-core@0.1.2

## 0.1.1

### Patch Changes

- d8a216e: fix: react-core build process
  fix: remove headless prop from KnockFeedProvider
  fix: move KnockFeedContainer from react-core to react and rename to NotificationFeedContainer
- Updated dependencies [d8a216e]
  - @knocklabs/react-core@0.1.1

## 0.1.0

### Patch Changes

- 5850374: chore: only redirect when action url is not empty
  feat: add a11y improvements to buttons
- bcdbc86: Initialize monorepo
- Updated dependencies [bcdbc86]
  - @knocklabs/react-core@0.1.0
