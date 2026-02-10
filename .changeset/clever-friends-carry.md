---
"@knocklabs/client": minor
"@knocklabs/react-core": minor
"@knocklabs/expo": minor
"@knocklabs/react": minor
"@knocklabs/react-native": minor
---

Initialize feeds in `"compact"` mode by default

The feed client can now be initialized with a `mode` option, set to either `"compact"` or `"rich"`. When `mode` is `"compact"`, the following restrictions will apply when the feed is fetched:

- `activities` and `total_activities` fields will _not_ be present on feed items
- The `data` field will _not_ include nested arrays and objects
- The `actors` field will only have up to one actor

**By default, feeds are initialized in `"compact"` mode. If you need to access `activities`, `total_activities`, the complete `data`, or the complete array of `actors`, you must initialize your feed in `"rich"` mode.**

If you are using the feed client via `@knocklabs/client` directly:

```js
const knockFeed = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
  { mode: "full" },
);
```

If you are using `<KnockFeedProvider>` via `@knocklabs/react`, `@knocklabs/react-native`, or `@knocklabs/expo`:

```tsx
<KnockFeedProvider
  feedId={process.env.KNOCK_FEED_CHANNEL_ID}
  defaultFeedOptions={{ mode: "full" }}
/>
```

If you are using the `useNotifications` hook via `@knocklabs/react-core`:

```js
const feedClient = useNotifications(
  knockClient,
  process.env.KNOCK_FEED_CHANNEL_ID,
  { mode: "full" },
);
```
