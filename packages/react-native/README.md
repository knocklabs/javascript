# Knock React Native SDK

A set of components for integrating [Knock](https://knock.app) in-app notifications into a React Native application.

[Full documentation](https://docs.knock.app/in-app-ui/react-native/overview)

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
2. A feed channel ID (found in the Knock dashboard)
3. A user ID, and optionally an auth token for production environments

## Usage

You can integrate the feed into your app as follows:

```jsx
import { KnockFeedProvider, NotificationIconButton, NotificationFeedPopover } from "@knocklabs/react-native";

const YourAppLayout = () => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <KnockFeedProvider apiKey={process.env.KNOCK_PUBLIC_API_KEY} feedId={process.env.KNOCK_FEED_ID} userId={currentUser.id}>
      <View>
        <Text>Notifications go in here!</Text>
      </View>
    </KnockFeedProvider>
  );
};
```

## Headless usage

Alternatively, if you don't want to use our components you can render the feed in a headless mode using our hooks:

```jsx
import { useAuthenticatedKnockClient, useNotifications } from "@knocklabs/react-native";
import create from "zustand";

const YourAppLayout = () => {
  const knockClient = useAuthenticatedKnockClient(process.env.KNOCK_PUBLIC_API_KEY, currentUser.id);

  const notificationFeed = useNotifications(knockClient, process.env.KNOCK_FEED_ID);

  const useNotificationStore = create(notificationFeed.store);
  const { metadata } = useNotificationStore();

  useEffect(() => {
    notificationFeed.fetch();
  }, [notificationFeed]);

  return <span>Total unread: {metadata.unread_count}</span>;
};
```

## Related links

- [Signup for Knock](https://knock.app)
- [Knock documentation](https://docs.knock.app)
- [Knock dashboard](https://dashboard.knock.app)
