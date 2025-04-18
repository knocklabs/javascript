# Knock React Native SDK

A set of components for integrating [Knock](https://knock.app) in-app notifications into a React Native application.

[Full documentation](https://docs.knock.app/in-app-ui/react-native/overview)

> Using Expo? See our [Expo SDK](../expo/README.md) and our [migration guide](../expo/README.md#migrating-from-knocklabsreact-native).

## Installation

Via NPM:

```
npm install @knocklabs/react-native
```

Via Yarn:

```
yarn add @knocklabs/react-native
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
} from "@knocklabs/react-native";

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
import {
  useAuthenticatedKnockClient,
  useNotifications,
  useNotificationStore,
} from "@knocklabs/react-native";

const YourAppLayout = () => {
  const knockClient = useAuthenticatedKnockClient(
    process.env.KNOCK_PUBLIC_API_KEY,
    currentUser.id,
  );

  const notificationFeed = useNotifications(
    knockClient,
    process.env.KNOCK_FEED_ID,
  );

  const { metadata } = useNotificationStore(notificationFeed);

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
- [React Native SDK documentation](https://docs.knock.app/sdks/react-native/overview)

