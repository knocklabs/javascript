# Changelog

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
