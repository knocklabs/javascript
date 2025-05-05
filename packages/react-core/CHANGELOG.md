# Changelog

## 0.6.9

### Patch Changes

- 329ee05: downgrade tanstack store deps to 0.6.x to work in older TS version
- Updated dependencies [329ee05]
  - @knocklabs/client@0.14.8

## 0.6.8

### Patch Changes

- Updated dependencies [efd1005]
  - @knocklabs/client@0.14.7

## 0.6.7

### Patch Changes

- Updated dependencies [a5c615e]
  - @knocklabs/client@0.14.6

## 0.6.6

### Patch Changes

- 8f00623: activation location rules support for guides
- Updated dependencies [8f00623]
  - @knocklabs/client@0.14.5

## 0.6.5

### Patch Changes

- e800896: feat: typescript fixes + quality of life improvements
- Updated dependencies [e800896]
  - @knocklabs/client@0.14.4

## 0.6.4

### Patch Changes

- 96d70bc: fixes memory leak when unmounting the useNotifications hook

## 0.6.3

### Patch Changes

- c97a1d9: Update TanStack Store
- Updated dependencies [c97a1d9]
  - @knocklabs/client@0.14.3

## 0.6.2

### Patch Changes

- Updated dependencies [00439a2]
  - @knocklabs/client@0.14.2

## 0.6.1

### Patch Changes

- Updated dependencies [4c41841]
  - @knocklabs/client@0.14.1

## 0.6.0

### Minor Changes

- 711948c: feat: add guide client, hooks, provider, and components

### Patch Changes

- Updated dependencies [711948c]
  - @knocklabs/client@0.14.0

## 0.5.2

### Patch Changes

- Updated dependencies [187abc1]
  - @knocklabs/client@0.13.1

## 0.5.1

### Patch Changes

- Updated dependencies [4cd1b1e]
  - @knocklabs/client@0.13.0

## 0.5.0

### Minor Changes

- 8ba5dcb: [JS] Support React 19 in React SDKs

### Patch Changes

- Updated dependencies [8ba5dcb]
  - @knocklabs/client@0.12.0

## 0.4.2

### Patch Changes

- 226e319: Fix unnecessary refetches of first page by `useSlackChannels` and `useMsTeamsTeams` hooks

  Previously, both the `useSlackChannels` and `useMsTeamsTeams` hooks would unnecessarily refetch the first page of data whenever multiple pages of data were loaded. This has been fixed.

## 0.4.1

### Patch Changes

- 1b86a0c: fix: correct pagination logic in useSlackChannels hook (KNO-7995)

## 0.4.0

### Minor Changes

- 7904b65: Remove `slackSearchbarMultipleChannels` from translations strings

## 0.3.4

### Patch Changes

- Updated dependencies [8ea25f4]
  - @knocklabs/client@0.11.4

## 0.3.3

### Patch Changes

- 12bc993: Use SWR in `useConnectedSlackChannels` hook

  `useConnectedSlackChannels` now uses [SWR](https://swr.vercel.app/) under the hood. The returned array of connections (`data`) will now update optimistically when `updateConnectedChannels` is called.

- Updated dependencies [4f76cd6]
  - @knocklabs/client@0.11.3

## 0.3.2

### Patch Changes

- 85418a0: rename constants.ts to interfaces.ts
- 8cc9338: Fix types in useConnectedSlackChannels.ts
- da84a75: deprecate tenant in favor of tenantId in KnockSlackProvider and useKnockSlackClient
- 2161d3f: Use SWR for data fetching in useConnectedMsTeamsChannels hook
- 1ba1393: add TeamsKit hooks for teams and channels
- Updated dependencies [2161d3f]
- Updated dependencies [2161d3f]
- Updated dependencies [1ba1393]
- Updated dependencies [b4b5c02]
  - @knocklabs/client@0.11.2

## 0.3.1

### Patch Changes

- b9f6712: fix: types for userId should handle undefined and null
- Updated dependencies [b9f6712]
  - @knocklabs/client@0.11.1

## 0.3.0

### Minor Changes

- 013ad8d: feat: add MsTeamsAuthButton

### Patch Changes

- Updated dependencies [013ad8d]
  - @knocklabs/client@0.11.0

## 0.2.29

### Patch Changes

- Updated dependencies [26db496]
- Updated dependencies [988aaf9]
  - @knocklabs/client@0.10.17

## 0.2.28

### Patch Changes

- Updated dependencies [bc99374]
  - @knocklabs/client@0.10.16

## 0.2.27

### Patch Changes

- Updated dependencies [26166e3]
  - @knocklabs/client@0.10.15

## 0.2.26

### Patch Changes

- Updated dependencies [7510909]
  - @knocklabs/client@0.10.14

## 0.2.25

### Patch Changes

- 47a88da: feature: allow passing additional OAuth scope to SlackAuthButton

## 0.2.24

### Patch Changes

- 1d440f7: feat: add prebuilt In App Feed Components for React Native
- Updated dependencies [1d440f7]
  - @knocklabs/client@0.10.13

## 0.2.23

### Patch Changes

- Updated dependencies [5545f9e]
  - @knocklabs/client@0.10.12

## 0.2.22

### Patch Changes

- Updated dependencies [395f0ca]
  - @knocklabs/client@0.10.11

## 0.2.21

### Patch Changes

- a4d520c: chore: update generic types
- Updated dependencies [a4d520c]
  - @knocklabs/client@0.10.10

## 0.2.20

### Patch Changes

- Updated dependencies [d0adb14]
  - @knocklabs/client@0.10.9

## 0.2.19

### Patch Changes

- 1e60c19: fix: re-introduce subscribe/setstate call for useNotifications

## 0.2.18

### Patch Changes

- 29e3942: fix: introduce new useNotificationStore hook to prevent issues that prevent state updates
- Updated dependencies [29e3942]
  - @knocklabs/client@0.10.8

## 0.2.17

### Patch Changes

- f25b112: fix: ensure feed store reference re-renders after changes to user
- Updated dependencies [f25b112]
  - @knocklabs/client@0.10.7

## 0.2.16

### Patch Changes

- 5d2ddab: fix: ensure options are memoized in useAuthenticatedKnockClient

## 0.2.15

### Patch Changes

- b29a47a: Add KnockExpoPushNotificationProvider to react-native sdk
- Updated dependencies [b29a47a]
  - @knocklabs/client@0.10.6

## 0.2.14

### Patch Changes

- 5fe3063: Fixes issue where notification data was not updating in react strict mode

## 0.2.13

### Patch Changes

- Updated dependencies [044eb0f]
  - @knocklabs/client@0.10.5

## 0.2.12

### Patch Changes

- Updated dependencies [5a7c56e]
  - @knocklabs/client@0.10.4

## 0.2.11

### Patch Changes

- Updated dependencies [a71ce51]
  - @knocklabs/client@0.10.3

## 0.2.10

### Patch Changes

- 42ba22c: fix: improve typing for react < 18
- Updated dependencies [42ba22c]
  - @knocklabs/client@0.10.2

## 0.2.9

### Patch Changes

- 354dd1a: fix: move away from jsx runtime to support react 16 + 17

## 0.2.8

### Patch Changes

- 3c277cb: fix: remove react-query and replace with swr for react 16+ support
- Updated dependencies [3c277cb]
- Updated dependencies [567e24f]
  - @knocklabs/client@0.10.1

## 0.2.7

### Patch Changes

- Updated dependencies [8bdc75b]
  - @knocklabs/client@0.10.0

## 0.2.6

### Patch Changes

- Updated dependencies [f58371c]
  - @knocklabs/client@0.9.4

## 0.2.5

### Patch Changes

- 10b5646: Include src files for react-core

## 0.2.4

### Patch Changes

- bc69618: Add react-native to package.json files to fix a bug in our React Native SDK
- Updated dependencies [bc69618]
  - @knocklabs/client@0.9.3

## 0.2.3

### Patch Changes

- Updated dependencies [fed0f8c]
  - @knocklabs/client@0.9.2

## 0.2.2

### Patch Changes

- 282d005: Handle auth disconnected status.

## 0.2.1

### Patch Changes

- Updated dependencies [f37d680]
  - @knocklabs/client@0.9.1

## 0.2.0

### Minor Changes

- 627e643: Add SlackKit components, hooks, client JS functions, and example apps.

### Patch Changes

- e076109: Fix hover state for connect button.
- Updated dependencies [627e643]
  - @knocklabs/client@0.9.0

## 0.1.6

### Patch Changes

- c9faba5: fix esm build issues with mjs files
- Updated dependencies [c9faba5]
  - @knocklabs/client@0.8.21

## 0.1.5

### Patch Changes

- Re-releasing packages
- Updated dependencies
  - @knocklabs/client@0.8.20

## 0.1.4

### Patch Changes

- 7786ec5: chore: upgrade to yarn modern and update local package references
- 9dd0d15: feat: add onUserTokenExpiring callback option to client
- Updated dependencies [7786ec5]
- Updated dependencies [9dd0d15]
  - @knocklabs/client@0.8.19

## 0.1.3

### Patch Changes

- 1050660: feat: switch timestamp formatting to date-fns intlFormatDistance
- Updated dependencies [e53c200]
- Updated dependencies [d4ba1f2]
  - @knocklabs/client@0.8.18

## 0.1.2

### Patch Changes

- 8988230: Fix esm exports and date-fns/locale imports
- 8315372: Fix cjs build output for React components

## 0.1.1

### Patch Changes

- d8a216e: fix: react-core build process
  fix: remove headless prop from KnockFeedProvider
  fix: move KnockFeedContainer from react-core to react and rename to NotificationFeedContainer

## 0.1.0

### Patch Changes

- bcdbc86: Initialize monorepo
