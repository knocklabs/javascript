---
"@knocklabs/client": minor
---

Exclude metadata when refetching feed after new message received

Starting with this release, if you configure a feed client to listen for events via [`Feed.on()`](https://docs.knock.app/in-app-ui/javascript/sdk/feed-client#on), the payload for feed events of type `"items.received.realtime"` will always have `metadata` set to `undefined`.

```js
const knockFeed = knock.feeds.initialize(process.env.KNOCK_FEED_CHANNEL_ID);

knockFeed.on("items.received.realtime", (eventPayload) => {
  // eventPayload.metadata will always be undefined here
  const { items, metadata } = eventPayload;
});
```
