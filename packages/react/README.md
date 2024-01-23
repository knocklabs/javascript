# @knocklabs/react

A set of components for integrating [Knock](https://knock.app) into a React application.

> Using `@knocklabs/react-notification-feed`? See the [migration guide](https://docs.knock.app/in-app-ui/react/migrating-from-react-notification-feed) for instructions on switching to `@knocklabs/react`.

[See a live demo](https://knock-in-app-notifications-react.vercel.app/)

![In-app feed component example](NotificationFeed.png)

**Note: these components are designed to be used via React for web only.**

[Full documentation](https://docs.knock.app/in-app-ui/react/overview)

## Installation

Via NPM:

```
npm install @knocklabs/react
```

Via Yarn:

```
yarn add @knocklabs/react
```

## Configuration

To configure the feed you will need:

1. A public API key (found in the Knock dashboard)
1. A user ID, and optionally an auth token for production environments
1. If integrating an in-app feed, a feed channel ID (found in the Knock dashboard)

## Usage

You can integrate Knock into your app as follows:

```jsx
import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";

// Required CSS import, unless you're overriding the styling
import "@knocklabs/react/dist/index.css";

const YourAppLayout = () => {
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);

  return (
    <KnockProvider apiKey={process.env.KNOCK_PUBLIC_API_KEY} userId={userId}>
      {/* Optionally, use the KnockFeedProvider to connect an in-app feed */}
      <KnockFeedProvider feedId={process.env.KNOCK_FEED_ID}>
        <div>
          <NotificationIconButton
            ref={notifButtonRef}
            onClick={(e) => setIsVisible(!isVisible)}
          />
          <NotificationFeedPopover
            buttonRef={notifButtonRef}
            isVisible={isVisible}
            onClose={() => setIsVisible(false)}
          />
        </div>
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
} from "@knocklabs/react";
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

  return <span>Total unread: {metadata.unread_count}</span>;
};
```

## Related links

- [Signup for Knock](https://knock.app)
- [Knock documentation](https://docs.knock.app)
- [Knock dashboard](https://dashboard.knock.app)
