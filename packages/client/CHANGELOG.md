# Changelog

## 0.21.0

### Minor Changes

- 2af3f5e: Initialize feeds in `"compact"` mode by default

  The feed client can now be initialized with a `mode` option, set to either `"compact"` or `"rich"`. When `mode` is `"compact"`, the following restrictions will apply when the feed is fetched:

  - The `activities` and `total_activities` fields will _not_ be present on feed items
  - The `data` field will _not_ include nested arrays and objects
  - The `actors` field will only have up to one actor

  **By default, feeds are initialized in `"compact"` mode. If you need to access `activities`, `total_activities`, the complete `data`, or the complete array of `actors`, you must initialize your feed in `"rich"` mode.**

  If you are using the feed client via `@knocklabs/client` directly:

  ```js
  const knockFeed = knockClient.feeds.initialize(
    process.env.KNOCK_FEED_CHANNEL_ID,
    { mode: "rich" },
  );
  ```

  If you are using `<KnockFeedProvider>` via `@knocklabs/react`, `@knocklabs/react-native`, or `@knocklabs/expo`:

  ```tsx
  <KnockFeedProvider
    feedId={process.env.KNOCK_FEED_CHANNEL_ID}
    defaultFeedOptions={{ mode: "rich" }}
  />
  ```

  If you are using the `useNotifications` hook via `@knocklabs/react-core`:

  ```js
  const feedClient = useNotifications(
    knockClient,
    process.env.KNOCK_FEED_CHANNEL_ID,
    { mode: "rich" },
  );
  ```

## 0.20.4

### Patch Changes

- 1c486d3: [guides] support search param in guide activation url patterns

## 0.20.3

### Patch Changes

- cf04e5f: [guides] check window properties in browser specific code paths for react native

## 0.20.2

### Patch Changes

- 09c11a3: [guides] fix: KnockGuideStep type definition to return a promise from async methods

## 0.20.1

### Patch Changes

- 01d07af: Fix TypeScript type mismatch in SetPreferencesProperties. All fields (workflows, categories, channel_types, channels) are now optional to match the nullable nature of PreferenceSet returned by getPreferences(). This allows users to pass preference data without type errors and properly supports partial updates.

## 0.20.0

### Minor Changes

- 2d29ebf: [guides] update selectGuides and useGuides to be subject to throttling by default

## 0.19.4

### Patch Changes

- a56bf70: [guide] include a tenant param for all engagement update requests

## 0.19.3

### Patch Changes

- 571abb1: Add `branch` option to `Knock` client

  The `Knock` client now accepts a `branch` option. To use `Knock` with a branch,
  set the `apiKey` param to your development environment's API key and set the
  `branch` option to the slug of an existing branch.

  ```js
  import Knock from "@knocklabs/client";

  const knock = new Knock(process.env.KNOCK_PUBLIC_API_KEY, {
    branch: "my-branch-slug",
  });
  ```

## 0.19.2

### Patch Changes

- 1e538b9: [guide] add a secondary entry point for nextjs specific helpers for guide location detection

## 0.19.1

### Patch Changes

- c4e67da: revert 4b888c4 to remove nextjs helper components and fix module resolution error

## 0.19.0

### Minor Changes

- be65601: - **Added channel-level notification preferences** to client interfaces, types, tests, and the Next.js example.
  - Update your code to handle the new channels property in `PreferenceSet`, `SetPreferencesProperties`, and `WorkflowPreferenceSetting` if using `@knock/client`.

### Patch Changes

- 4b888c4: [guides] add dedicated nextjs helper components for detecting location changes

## 0.18.7

### Patch Changes

- 56ab8c0: fix: ensure that user.id can be undefined

## 0.18.6

### Patch Changes

- 49df373: update guide as a new object ref when updating its step

## 0.18.5

### Patch Changes

- bf7677a: feat: persist guide debug state in local storage
- 9eba682: chore: use the new guide engagement update endpoints w/o message_id param

## 0.18.4

### Patch Changes

- c64098e: fix: handle promise rejection when identifying a user inline

## 0.18.3

### Patch Changes

- 9f0d317: fix(KNO-9711) Add step_ref to NotificationSource

  Add optional nullable field corresponding to API spec

## 0.18.2

### Patch Changes

- 1fc802b: fix(feed): optimistically update when unarchiving an item

## 0.18.1

### Patch Changes

- 74366b3: export useStore from react-core to include in use client directive

## 0.18.0

### Minor Changes

- 5fc0af9: feat: adds `identificationStrategy` option for user identification control

## 0.17.2

### Patch Changes

- 23b7057: fix: return preview guides even if no other guides are present
- 1c24f68: fix: filter out inactive guides in preview mode

## 0.17.1

### Patch Changes

- 5b77f18: fix: return non-published preview guides

## 0.17.0

### Minor Changes

- c761e7c: feat: support live previewing guides content
- b8b64e4: feat(beta): add support for basic guide debugging

### Patch Changes

- 3558784: add support for activation url rules in guide client

## 0.16.5

### Patch Changes

- dc84f25: chore: limit retries for guide client real time subscription

## 0.16.4

### Patch Changes

- 49f791b: fix: guard against undefined window object in ssr

## 0.16.3

### Patch Changes

- 79204f0: fix: export useGuides hook to react package

## 0.16.2

### Patch Changes

- 5a19d82: fix: knock.users.identify passes data through query params

## 0.16.1

### Patch Changes

- 35b5445: chore(deps): bump axios from 1.10.0 to 1.11.0
- 5d758d7: fix: fixes refused to set unsafe header "User-Agent"
- d2fd092: chore(deps-dev): bump @types/jsonwebtoken from 9.0.9 to 9.0.10

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
