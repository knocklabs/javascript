# Changelog

## 0.16.0

### Minor Changes

- 48e9c77: - Support guides ordering and throttle settings
  - Add `useGuides` hook

## 0.15.2

### Patch Changes

- fb68ce1: feat: adds javascript client version to user agent

## 0.15.1

### Patch Changes

- befd7b9: fix: when reseting the feed, real-time notifications stop working

## 0.15.0

### Minor Changes

- 2a0b3e2: Adds support for inline user `identify` calls when authenticating a user via the Knock client.
  You can now pass a `user` object, for example `{ id: "123" }`, directly to the `authenticate` function.
  Additional properties can also be included to update the user record, such as `{ id: "123", name: "Knock" }`.

  This update also applies to `KnockProvider`, where you can now pass a `user` prop instead of a `userId` prop to achieve the same behavior.

## 0.14.11

### Patch Changes

- 6539c97: patch fix package contents being built properly

## 0.14.10

### Patch Changes

- e05ad61: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- e05ad61: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- e05ad61: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.

## 0.14.10-canary.2

### Patch Changes

- e69da7b: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.

## 0.14.10-canary.1

### Patch Changes

- c76b2d9: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.

## 0.14.10-canary.0

### Patch Changes

- 86a72cc: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.

## 0.14.9

### Patch Changes

- 4e73f12: fix: ensure this is bound to guide client instance in handleLocationChange

## 0.14.8

### Patch Changes

- 329ee05: downgrade tanstack store deps to 0.6.x to work in older TS version

## 0.14.7

### Patch Changes

- efd1005: Fix CJS builds

  v0.14.6 of our client SDK did not support CJS. This version fixes CJS support.

## 0.14.6

### Patch Changes

- a5c615e: Allow multiple instances of `Feed` to listen for real-time updates to the same notification feed

  Previously, using two or more instances of `Feed` with the same in-app feed channel would result in
  only the most recently connected `Feed` receiving real-time updates. Now, all instances of `Feed`
  configured with the same in-app channel will receive real-time updates.

## 0.14.5

### Patch Changes

- 8f00623: activation location rules support for guides

## 0.14.4

### Patch Changes

- e800896: feat: typescript fixes + quality of life improvements

## 0.14.3

### Patch Changes

- c97a1d9: Update TanStack Store

## 0.14.2

### Patch Changes

- 00439a2: fix(KNO-7843): Fix types and stringify trigger_data for feed API requests

## 0.14.1

### Patch Changes

- 4c41841: feat: accept options in the fetchNextPage method

## 0.14.0

### Minor Changes

- 711948c: feat: add guide client, hooks, provider, and components

## 0.13.1

### Patch Changes

- 187abc1: Allows the feed to accept date range options upon initialization.

## 0.13.0

### Minor Changes

- 4cd1b1e: add support for filtering by date in the feed client

## 0.12.0

### Minor Changes

- 8ba5dcb: [JS] Support React 19 in React SDKs

## 0.11.4

### Patch Changes

- 8ea25f4: fix: include missing timestamp fields on FeedItem and Message

## 0.11.3

### Patch Changes

- 4f76cd6: fix: raise when calling user methods before auth

## 0.11.2

### Patch Changes

- 2161d3f: Make id and displayName required in MsTeamsTeam and MsTeamsChannel types
- 2161d3f: Add `ms_teams_team_id` to MsTeamsChannelConnection type
- 1ba1393: add TeamsKit hooks for teams and channels
- b4b5c02: add getTeams and getChannels to MsTeamsClient

## 0.11.1

### Patch Changes

- b9f6712: fix: types for userId should handle undefined and null

## 0.11.0

### Minor Changes

- 013ad8d: feat: add MsTeamsAuthButton

## 0.10.17

### Patch Changes

- 26db496: fix: ensure feed can render with empty/missing userId values
- 988aaf9: fix: engagement_status in BulkUpdateMessagesInChannelProperties type

## 0.10.16

### Patch Changes

- bc99374: fix: bundle client package using "compat" interop

## 0.10.15

### Patch Changes

- 26166e3: fix: update preference set types
- Updated dependencies [26166e3]
  - @knocklabs/types@0.1.5

## 0.10.14

### Patch Changes

- 7510909: fix: ensure axios is always imported correctly

## 0.10.13

### Patch Changes

- 1d440f7: feat: add prebuilt In App Feed Components for React Native

## 0.10.12

### Patch Changes

- 5545f9e: feat: support passing metadata for interactions

## 0.10.11

### Patch Changes

- 395f0ca: fix: check type of zustand default import and fix cjs build

## 0.10.10

### Patch Changes

- a4d520c: chore: update generic types
- Updated dependencies [a4d520c]
  - @knocklabs/types@0.1.4

## 0.10.9

### Patch Changes

- d0adb14: fix: don't destroy the store, ever

## 0.10.8

### Patch Changes

- 29e3942: fix: introduce new useNotificationStore hook to prevent issues that prevent state updates

## 0.10.7

### Patch Changes

- f25b112: fix: ensure feed store reference re-renders after changes to user

## 0.10.6

### Patch Changes

- b29a47a: Add KnockExpoPushNotificationProvider to react-native sdk

## 0.10.5

### Patch Changes

- 044eb0f: fix: check if document is defined before setting up auto socket manager

## 0.10.4

### Patch Changes

- 5a7c56e: fix: avoid adding duplicate visibiliy change event listeners

## 0.10.3

### Patch Changes

- a71ce51: fix: event types to use items. and fix types

## 0.10.2

### Patch Changes

- 42ba22c: fix: improve typing for react < 18

## 0.10.1

### Patch Changes

- 3c277cb: fix: remove react-query and replace with swr for react 16+ support
- 567e24f: fix: clean up visibility change event listener on feed teardown

## 0.10.0

### Minor Changes

- 8bdc75b: Added a new MessageClient to access message api's independently from the Feed.

## 0.9.4

### Patch Changes

- f58371c: Added user get and identify methods

## 0.9.3

### Patch Changes

- bc69618: Add react-native to package.json files to fix a bug in our React Native SDK

## 0.9.2

### Patch Changes

- fed0f8c: add support for actions in notification feed cells

## 0.9.1

### Patch Changes

- f37d680: Update event format for client status updates

## 0.9.0

### Minor Changes

- 627e643: Add SlackKit components, hooks, client JS functions, and example apps.

## 0.8.21

### Patch Changes

- c9faba5: fix esm build issues with mjs files

## 0.8.20

### Patch Changes

- Re-releasing packages

## 0.8.19

### Patch Changes

- 7786ec5: chore: upgrade to yarn modern and update local package references
- 9dd0d15: feat: add onUserTokenExpiring callback option to client

## 0.8.18

### Patch Changes

- e53c200: fix: strip socket manager options from http requests
- d4ba1f2: chore: add shared types package

## 0.8.17

### Patch Changes

- 345ebc1: feat: add option to automatically manage open socket connections

## 0.8.16

### Patch Changes

- 7bc5e4a: fix: add @babel/runtime dependency
