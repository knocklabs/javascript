# Changelog

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
