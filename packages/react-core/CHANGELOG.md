# Changelog

## 0.13.1

### Patch Changes

- 7f8bdfe: Add accessible labels to `UnseenBadge` so screen readers announce the count with context (e.g. "3 unseen notifications") instead of just the bare number
- Updated dependencies [ddd7981]
  - @knocklabs/client@0.21.1

## 0.13.0

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

### Patch Changes

- Updated dependencies [2af3f5e]
  - @knocklabs/client@0.21.0

## 0.12.5

### Patch Changes

- Updated dependencies [1c486d3]
  - @knocklabs/client@0.20.4

## 0.12.4

### Patch Changes

- f9aca69: fix: poll to check if OAuth connection succeeded in case popup communication fails during Slack and Microsoft Teams auth flows

## 0.12.3

### Patch Changes

- Updated dependencies [cf04e5f]
  - @knocklabs/client@0.20.3

## 0.12.2

### Patch Changes

- Updated dependencies [09c11a3]
  - @knocklabs/client@0.20.2

## 0.12.1

### Patch Changes

- Updated dependencies [01d07af]
  - @knocklabs/client@0.20.1

## 0.12.0

### Minor Changes

- 2d29ebf: [guides] update selectGuides and useGuides to be subject to throttling by default

### Patch Changes

- Updated dependencies [2d29ebf]
  - @knocklabs/client@0.20.0

## 0.11.5

### Patch Changes

- 98a9464: Fix cache issues in `useMsTeamsChannels`, `useMsTeamsTeams`, and `useSlackChannels` hooks

  The cache keys for these hooks now include `tenantId` and `knockChannelId` to ensure that different tenants and Knock channels have separate cache entries. Additionally, the hooks now clear their SWR cache when:

  - The tenant ID changes
  - The Knock channel ID changes
  - The access token is revoked
  - The connection status transitions from disconnected/error to connected

  This prevents stale data from being displayed when switching between different workspaces, revoking access tokens, or reconnecting.

## 0.11.4

### Patch Changes

- Updated dependencies [a56bf70]
  - @knocklabs/client@0.19.4

## 0.11.3

### Patch Changes

- 571abb1: Add `branch` option to `useAuthenticatedKnockClient` hook

  The `useAuthenticatedKnockClient` hook now accepts a `branch` option. To use
  `useAuthenticatedKnockClient` with a branch, set the `apiKey` param to your
  development environment's API key and set the `branch` option to the slug of an
  existing branch.

  ```tsx
  import { useAuthenticatedKnockClient } from "@knocklabs/react-core";

  const knock = useAuthenticatedKnockClient(
    process.env.KNOCK_PUBLIC_API_KEY,
    { id: user.id },
    undefined, // userToken when needed
    { branch: "my-branch-slug" },
  );
  ```

- f4529cc: Enable use of SlackKit with branches

  The `useSlackAuth` hook exported by `@knocklabs/react-core` has been updated so
  that it works with branches. You can now use either this hook or the
  `<SlackAuthButton>` component exported by `@knocklabs/react` to test connecting
  Slack workspaces to Knock tenants while working on a branch.

- f278892: Enable use of TeamsKit with branches

  The `useMsTeamsAuth` hook exported by `@knocklabs/react-core` has been updated
  so that it works with branches. You can now use either this hook or the
  `<MsTeamsAuthButton>` component exported by `@knocklabs/react` to test
  connecting Microsoft Teams organizations to Knock tenants while working on a
  branch.

- 571abb1: Add `branch` prop to `<KnockProvider>`

  The `<KnockProvider>` context provider now accepts an optional `branch` prop.
  To use `<KnockProvider>` with a branch, set the `apiKey` prop to your
  development environment's API key and set `branch` to the slug of an existing
  branch.

  ```tsx
  import { KnockProvider } from "@knocklabs/react";

  const YourAppLayout = () => {
    return (
      <KnockProvider
        apiKey={process.env.KNOCK_PUBLIC_API_KEY}
        user={{ id: user.id }}
        branch="my-branch-slug"
      >
        {/** the rest of your app */}
      </KnockProvider>
    );
  };
  ```

- Updated dependencies [571abb1]
  - @knocklabs/client@0.19.3

## 0.11.2

### Patch Changes

- Updated dependencies [1e538b9]
  - @knocklabs/client@0.19.2

## 0.11.1

### Patch Changes

- Updated dependencies [c4e67da]
  - @knocklabs/client@0.19.1

## 0.11.0

### Minor Changes

- be65601: - **Added channel-level notification preferences** to client interfaces, types, tests, and the Next.js example.
  - Update your code to handle the new channels property in `PreferenceSet`, `SetPreferencesProperties`, and `WorkflowPreferenceSetting` if using `@knock/client`.

### Patch Changes

- Updated dependencies [be65601]
- Updated dependencies [4b888c4]
  - @knocklabs/client@0.19.0

## 0.10.7

### Patch Changes

- Updated dependencies [56ab8c0]
  - @knocklabs/client@0.18.7

## 0.10.6

### Patch Changes

- Updated dependencies [49df373]
  - @knocklabs/client@0.18.6

## 0.10.5

### Patch Changes

- Updated dependencies [bf7677a]
- Updated dependencies [9eba682]
  - @knocklabs/client@0.18.5

## 0.10.4

### Patch Changes

- Updated dependencies [c64098e]
  - @knocklabs/client@0.18.4

## 0.10.3

### Patch Changes

- Updated dependencies [9f0d317]
  - @knocklabs/client@0.18.3

## 0.10.2

### Patch Changes

- Updated dependencies [1fc802b]
  - @knocklabs/client@0.18.2

## 0.10.1

### Patch Changes

- 74366b3: export useStore from react-core to include in use client directive
- Updated dependencies [74366b3]
  - @knocklabs/client@0.18.1

## 0.10.0

### Minor Changes

- 5fc0af9: feat: adds `identificationStrategy` option for user identification control

### Patch Changes

- Updated dependencies [5fc0af9]
  - @knocklabs/client@0.18.0

## 0.9.2

### Patch Changes

- Updated dependencies [23b7057]
- Updated dependencies [1c24f68]
  - @knocklabs/client@0.17.2

## 0.9.1

### Patch Changes

- Updated dependencies [5b77f18]
  - @knocklabs/client@0.17.1

## 0.9.0

### Minor Changes

- b8b64e4: feat(beta): add support for basic guide debugging

### Patch Changes

- Updated dependencies [c761e7c]
- Updated dependencies [3558784]
- Updated dependencies [b8b64e4]
  - @knocklabs/client@0.17.0

## 0.8.5

### Patch Changes

- Updated dependencies [dc84f25]
  - @knocklabs/client@0.16.5

## 0.8.4

### Patch Changes

- Updated dependencies [49f791b]
  - @knocklabs/client@0.16.4

## 0.8.3

### Patch Changes

- 79204f0: fix: export useGuides hook to react package
- Updated dependencies [79204f0]
  - @knocklabs/client@0.16.3

## 0.8.2

### Patch Changes

- Updated dependencies [5a19d82]
  - @knocklabs/client@0.16.2

## 0.8.1

### Patch Changes

- Updated dependencies [35b5445]
- Updated dependencies [5d758d7]
- Updated dependencies [d2fd092]
  - @knocklabs/client@0.16.1

## 0.8.0

### Minor Changes

- 48e9c77: - Support guides ordering and throttle settings
  - Add `useGuides` hook

### Patch Changes

- Updated dependencies [48e9c77]
  - @knocklabs/client@0.16.0

## 0.7.5

### Patch Changes

- d7e5371: chore(deps): bump @tanstack/react-store from 0.7.1 to 0.7.3
- Updated dependencies [fb68ce1]
  - @knocklabs/client@0.15.2

## 0.7.4

### Patch Changes

- 001690a: Rename `msTeamsBotId` param of `useMsTeamsAuth` hook to `graphApiClientId`

## 0.7.3

### Patch Changes

- c3efcf9: Resolve logic error in Slack connection status
- Updated dependencies [befd7b9]
  - @knocklabs/client@0.15.1

## 0.7.2

### Patch Changes

- 3703cf6: feat: adds `usePreferences` hook for fetching and updating user preferences in react apps.
- fdc6d82: chore(deps): bump the telegraph-packages group across 1 directory with 9 updates

## 0.7.1

### Patch Changes

- aa16c97: fix: make the user prop to KnockProvider stable by comparing equality, and prevent re-instantiating the knock client unnecessarily

## 0.7.0

### Minor Changes

- 2a0b3e2: Adds support for inline user `identify` calls when authenticating a user via the Knock client.
  You can now pass a `user` object, for example `{ id: "123" }`, directly to the `authenticate` function.
  Additional properties can also be included to update the user record, such as `{ id: "123", name: "Knock" }`.

  This update also applies to `KnockProvider`, where you can now pass a `user` prop instead of a `userId` prop to achieve the same behavior.

### Patch Changes

- Updated dependencies [2a0b3e2]
  - @knocklabs/client@0.15.0

## 0.6.15

### Patch Changes

- 6539c97: patch fix package contents being built properly
- Updated dependencies [6539c97]
  - @knocklabs/client@0.14.11

## 0.6.14

### Patch Changes

- e05ad61: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- e05ad61: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- e05ad61: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- Updated dependencies [e05ad61]
- Updated dependencies [e05ad61]
- Updated dependencies [e05ad61]
  - @knocklabs/client@0.14.10

## 0.6.14-canary.2

### Patch Changes

- e69da7b: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- Updated dependencies [e69da7b]
  - @knocklabs/client@0.14.10-canary.2

## 0.6.14-canary.1

### Patch Changes

- c76b2d9: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- Updated dependencies [c76b2d9]
  - @knocklabs/client@0.14.10-canary.1

## 0.6.14-canary.0

### Patch Changes

- 86a72cc: feat: Migrates the internal store library from zustand to @tanstack/store. This is a non-breaking change that maintains backwards compatibility with the @knocklabs/client and @knocklabs/react-core packages.
- Updated dependencies [86a72cc]
  - @knocklabs/client@0.14.10-canary.0

## 0.6.13

### Patch Changes

- bea5604: update @knocklabs/react & @knocklabs/react-core to use named exports instead of barrel exports

## 0.6.12

### Patch Changes

- Updated dependencies [4e73f12]
  - @knocklabs/client@0.14.9

## 0.6.11

### Patch Changes

- dbbbaf7: Dispose of feed on unmount in `useNotifications` hook

  Previously, the `useNotifications` hook did not clean up old instances of `Feed`
  on unmount. This has been fixed.

## 0.6.10

### Patch Changes

- 337bade: feat: introduce ability to override slack scopes

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
