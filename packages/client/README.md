# Knock Javascript client library

A client-side Javascript library to interact with user-facing Knock features, such as feeds.

**Note: this is a lower level library designed for building UI on top of**

## Documentation

See the [documentation](https://docs.knock.app/notification-feeds/bring-your-own-ui) for usage examples.

## Installation

Via NPM:

```bash
npm install @knocklabs/client
```

Via Yarn:

```bash
yarn add @knocklabs/client
```

## Configuration

To configure the client library you will need:

1. A public API key (found in the Knock dashboard)
2. A feed channel ID (found in the Knock dashboard)
3. A user ID, and optionally an auth token for production environments

```typescript
import Knock from "@knocklabs/client";

const knockClient = new Knock(process.env.KNOCK_API_KEY);

knockClient.authenticate(
  // The id of the user you want to authenticate against
  currentUser.id,
  // You only need this in production environments
  currentUser.knockToken,
);
```

### Logging out and authentication state

While a client is unauthenticated it is fully quiescent: user-scoped calls (feed
fetches, mark-as-read, guides, Slack/Teams checks, etc.) become no-ops rather
than firing requests or throwing, and no real-time socket is opened. This makes
it safe to construct a client before you have a user.

Call `logout()` to clear the current user and tear down all stateful
connections (the socket, the token-expiration timer, and the page-visibility
listener):

```typescript
knockClient.logout();
```

You can observe authentication state via `knockClient.authStatus`
(`"authenticated" | "unauthenticated"`) or subscribe to the `knockClient.authStore`
for changes. In React, prefer the `enabled` prop on `KnockProvider` (see
`@knocklabs/react`), which manages this lifecycle for you.

### Retrieving new items from the feed

```typescript
import Knock from "@knocklabs/client";

const knockClient = new Knock(process.env.KNOCK_API_KEY);

// Authenticate the user
knockClient.authenticate(currentUser.id, currentUser.knockToken);

// Initialize the feed
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
  // Optionally you can provide a default scope here:
  // { tenant: "jurassic-park", source: "new-comment" },
);

// Connect to the real-time socket
feedClient.listenForUpdates();

// Setup a callback for when a batch of items is received (including on first load and subsequent page load)
feedClient.on("items.received.page", ({ items }) => {
  console.log(items);
});

// Setup a callback for when new items arrive in real-time
feedClient.on("items.received.realtime", ({ items }) => {
  console.log(items);
});

// Listen to all received items
feedClient.on("items.received.*", ({ items }) => {
  console.log(items);
});

// Fetch the feed items
feedClient.fetch({
  // Fetch a particular status only (defaults to all)
  status: "all" | "unread" | "unseen",
  // Pagination options
  after: lastItem.__cursor,
  before: firstItem.__cursor,
  // Defaults to 50
  page_size: 10,
  // Filter by a specific source
  source: "notification-key",
  // Filter by a specific tenant
  tenant: "jurassic-park",
});

feedClient.teardown();
```

### Reading the feed store state (programmatically)

```typescript
// Initialize the feed as in above examples
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
);

// Gives you all of the items currently in the store
const { items } = feedClient.store.getState();
```

### Reading the feed store state (in React)

```typescript
// Initialize the feed as in above examples
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
);

const feedStore = feedClient.store;

// Retrieves all of the items
const items = feedStore.getState().items;

// Retrieve the badge counts
const meta = feedStore.getState().metadata;
```

### Marking items as read, seen, or archived

```typescript
// Initialize the feed as in above examples
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
);

// Mark one or more items as read
feedClient.markAsRead(feedItemOrItems);
// Mark one or more items as seen
feedClient.markAsSeen(feedItemOrItems);
// Mark one or more items as archived
feedClient.markAsArchived(feedItemOrItems);

// Mark one or more items as unread
feedClient.markAsUnread(feedItemOrItems);
// Mark one or more items as unseen
feedClient.markAsUnseen(feedItemOrItems);
// Mark one or more items as unarchived
feedClient.markAsUnarchived(feedItemOrItems);
```

### Managing user preferences

```typescript
// Set an entire preference set
await knockClient.user.setPreferences({
  channel_types: { email: true, sms: false },
  workflows: {
    "dinosaurs-loose": {
      channel_types: { email: false, in_app_feed: true },
    },
  },
});

// Retrieve a whole preference set
const preferences = await knockClient.user.getPreferences();

// Retrieve all preference sets for the user
const preferenceSets = await knockClient.user.getAllPreferences();
```

### Managing the current user's channel data

```typescript
// Get user channel data
const channelData = await knockClient.user.getChannelData({
  channelId: "uuid-knock-channel-id",
});
```

```typescript
// Set push channel data for a user
await knockClient.user.setChannelData({
  channelId: "uuid-knock-channel-id",
  channelData: {
    tokens: ["apns-user-push-token"],
  },
});
```

See provider requirements for setting channel data [here]("https://docs.knock.app/managing-recipients/setting-channel-data#provider-data-requirements").

### Automatically disconnect sockets from inactive tabs

Optionally, you can configure the client to disconnect socket connections with inactive tabs after a brief delay. If the tab becomes active again, the socket will reconnect to continue receiving real-time notification updates.

```typescript
// Initialize the feed and configure the automatic disconnect settings
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
  {
    // Turn on the automatic connection manager
    auto_manage_socket_connection: true,
    // Optionally, customize the delay amount in milliseconds. Defaults to 2000ms or 2s
    auto_manage_socket_connection_delay: 2500,
  },
);
```
