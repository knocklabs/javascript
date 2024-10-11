# Knock Expo SDK

A set of components for integrating [Knock](https://knock.app) in-app notifications into an Expo + React Native application.

> Not using Expo? See our vanilla [React Native SDK](../react-native/README.md).

## Installation

Via NPM:

```
npm install @knocklabs/expo
```

Via Yarn:

```
yarn add @knocklabs/expo
```

## Configuration

To configure the feed you will need:

1. A public API key (found in the Knock dashboard)
1. A user ID, and optionally an auth token for production environments
1. If integrating an in-app feed, a feed channel ID (found in the Knock dashboard)

## Usage

You can integrate the feed into your app as follows:

```jsx
import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeedContainer,
} from "@knocklabs/expo";

const YourAppLayout = () => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <KnockProvider apiKey={process.env.KNOCK_PUBLIC_API_KEY} userId={userId}>
      <KnockFeedProvider feedId={process.env.KNOCK_FEED_ID}>
        <NotificationFeedContainer>
          <Text>Notifications go in here!</Text>
        </NotificationFeedContainer>
      </KnockFeedProvider>
    </KnockProvider>
  );
};
```

## Headless usage

Alternatively, if you don't want to use our components you can render the feed in a headless mode using our hooks:

```jsx
import { useAuthenticatedKnockClient, useNotifications } from "@knocklabs/expo";
import create from "zustand";

const YourAppLayout = () => {
  const knockClient = useAuthenticatedKnockClient(
    process.env.KNOCK_PUBLIC_API_KEY,
    currentUser.id,
  );

  const notificationFeed = useNotifications(
    knockClient,
    process.env.KNOCK_FEED_ID,
  );

  const useNotificationStore = create(notificationFeed.store);
  const { metadata } = useNotificationStore();

  useEffect(() => {
    notificationFeed.fetch();
  }, [notificationFeed]);

  return <Text>Total unread: {metadata.unread_count}</Text>;
};
```

## Related links

- [Signup for Knock](https://knock.app)
- [Knock documentation](https://docs.knock.app)
- [Knock dashboard](https://dashboard.knock.app)
