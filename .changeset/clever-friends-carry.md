---
"@knocklabs/client": minor
---

Initialize feeds in `"compact"` mode by default

The feed client can now be initialized with a `mode` option, set to either `"compact"` or `"rich"`. When `mode` is `"compact"`, the `activities` and `total_activities` fields will _not_ be present on feed items.

```js
const knockFeed = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
  { mode: "compact" },
);
```

**By default, feeds are initialized in `"compact"` mode. If you need to access `activities` and/or `total_activities`, you must initialize your feed in `"rich"` mode.**
