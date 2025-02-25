# Upgrading `@knocklabs/react` to v0.6.0

This upgrade guide includes instructions for upgrading to the latest version of `@knocklabs/client` and the Knock SDK packages that depend on it.

This update impacts the following packages:
- Upgrading `@knocklabs/client` to v0.12.0
- Upgrading `@knocklabs/react-core` to v0.5.0
- Upgrading `@knocklabs/react` to v0.6.0
- Upgrading `@knocklabs/react-native` to v0.6.0
- Upgrading `@knocklabs/expo` to v0.3.0

## Breaking changes

As part of this update, we've upgraded our dependency on `zustand` to use version [`4.5.6`](https://github.com/pmndrs/zustand/tree/v4.5.6). This means that we've had to make some potentially breaking changes to the API around accessing the data store.

> [!IMPORTANT]  
> If you only accessed the store through the `useNotificationStore` hook, you can continue to use the `useNotificationStore` hook as before without changes. **These breaking changes only affect consumers who were accessing the store directly through `feedClient.store`.**

### Changes to `feedClient.store`

You no longer need to use your own Zustand dependency to access the store directly. You can now access the store directly using the `store` property on the `feedClient` object.

#### Example One
**Before:**
```tsx
import { create } from 'zustand';

// Initialize the feed
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
  process.env.KNOCK_FEED_CHANNEL_ID,
);

// You used to need to create your own zustand hook to access the store
const useFeedStore = create(feedClient.store);

// Retrieves all of the items
const items = useFeedStore((state) => state.items);

// Retrieve the badge counts
const meta = useFeedStore((state) => state.metadata);
```

**After:**
```tsx
// You no longer need to use your own zustand hook to access the store

// Initialize the feed as in above examples
const feedClient = knockClient.feeds.initialize(
  process.env.KNOCK_FEED_CHANNEL_ID,
  process.env.KNOCK_FEED_CHANNEL_ID,
);

// Access the store directly from the feedClient
const feedStore = feedClient.store;

// Retrieves all of the items from state
const items = feedStore.getState().items;

// Retrieve the badge counts from state
const meta = feedStore.getState().metadata;
```

#### Example Two

**Before:**
```tsx
// Get the feed client
const knockClient = useAuthenticatedKnockClient(
    process.env.KNOCK_PUBLIC_API_KEY,
    currentUser.id,
);

// Get the notification feed using useNotifications()
const notificationFeed = useNotifications(
    knockClient,
    process.env.KNOCK_FEED_ID,
);

// Get the store
const useNotificationStore = create(notificationFeed.store);

// Retrieve the metadata
const { metadata } = useNotificationStore();
```

**After:**
```tsx
// No longer need to import zustand

// Get the feed client
const knockClient = useAuthenticatedKnockClient(
    process.env.KNOCK_PUBLIC_API_KEY,
    currentUser.id,
);

// Get the notification feed using useNotifications()
const notificationFeed = useNotifications(
    knockClient,
    process.env.KNOCK_FEED_ID,
);

// Get the store
const notificationStore = notificationFeed.store;

// Retrieve the metadata
const { metadata } = notificationStore.getState();
```

#### Type Changes

With this change, the type of `feed.store` has updated to reflect the new API.

Before:
```tsx
StoreApi<FeedStoreState>
```

After:
```tsx
UseBoundStore<StoreApi<FeedStoreState>>
```

## Support

If you run into any issues, please open an issue on [GitHub](https://github.com/knocklabs/javascript/issues) or reach out to our support team.
