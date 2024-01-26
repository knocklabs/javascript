import { useEffect, useMemo } from "react";
import "./App.css";
import Knock from "@knocklabs/client";
import create from "zustand";

const knockClient = new Knock(process.env.REACT_APP_KNOCK_API_KEY, {
  host: process.env.REACT_APP_KNOCK_HOST,
});

knockClient.authenticate(process.env.REACT_APP_KNOCK_USER_ID);

const useNotificationFeed = (knockClient, feedId) => {
  return useMemo(() => {
    // Create the notification feed instance
    const notificationFeed = knockClient.feeds.initialize(feedId, {
      auto_manage_socket_connection: 250,
    });
    const notificationStore = create(notificationFeed.store);
    notificationFeed.fetch();

    return [notificationFeed, notificationStore];
  }, [knockClient, feedId]);
};

function App() {
  const [feedClient, feedStore] = useNotificationFeed(
    knockClient,
    process.env.REACT_APP_KNOCK_CHANNEL_ID,
  );

  useEffect(() => {
    knockClient.preferences
      .get()
      .then((p) => {
        console.log(p);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  useEffect(() => {
    const teardown = feedClient.listenForUpdates();

    feedClient.on("messages.new", (data) => {
      console.log(data);
    });

    feedClient.on("items.received.*", (data) => {
      console.log(data);
    });

    return () => teardown?.();
  }, [feedClient]);

  const { loading, items, pageInfo } = feedStore((state) => state);

  return (
    <div className="App">
      <h1>Feed items</h1>

      {loading && <span>Loading...</span>}

      {items.map((item) => (
        <div key={item.id} className="feed-item">
          ID: {item.id}
          <br />
          Actor ID: {item.actors?.[0]?.id}
          <br />
          Actor email: {item.actors?.[0]?.email}
          <br />
          Inserted:{" "}
          {new Intl.DateTimeFormat("en-US", {
            dateStyle: "short",
            timeStyle: "medium",
          }).format(new Date(item.inserted_at))}
          <br />
        </div>
      ))}

      <button
        disabled={!pageInfo.after || loading}
        onClick={() => feedClient.fetchNextPage()}
      >
        Load more items
      </button>
    </div>
  );
}

export default App;
