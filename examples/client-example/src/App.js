import Knock from "@knocklabs/client";
import { useEffect, useMemo } from "react";

import "./App.css";

const knockClient = new Knock(process.env.REACT_APP_KNOCK_API_KEY, {
  host: process.env.REACT_APP_KNOCK_HOST,
});

knockClient.authenticate(process.env.REACT_APP_KNOCK_USER_ID);

const useNotificationFeed = (knockClient, feedId) => {
  return useMemo(() => {
    // Create the notification feed instance
    const notificationFeed = knockClient.feeds.initialize(feedId, {
      auto_manage_socket_connection: true,
      auto_manage_socket_connection_delay: 500,
    });
    const notificationStore = notificationFeed.store;
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

    feedClient.on("items.archived", (data) => {
      console.log(data);
    });

    return () => teardown?.();
  }, [feedClient]);

  const { loading, items, pageInfo } = feedStore((state) => state);

  return (
    <div className="App">
      <h1>Feed items</h1>
      <pre>{JSON.stringify(process.env, null, 2)}</pre>

      {loading && <span>Loading...</span>}

      {items.map((item) => (
        <div key={item.id} className="feed-item">
          ID: {item.id}
          <br />
          Has been read: {item.read_at ? "true" : "false"}
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
          <button
            onClick={() => {
              feedClient.markAsArchived(item);
            }}
          >
            Mark as archived
          </button>
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
