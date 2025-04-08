import Knock from "@knocklabs/client";
import { useEffect, useMemo, useState } from "react";

import "./App.css";

const knockClient = new Knock(import.meta.env.VITE_KNOCK_API_KEY, {
  host: import.meta.env.VITE_KNOCK_HOST,
});

knockClient.authenticate(import.meta.env.VITE_KNOCK_USER_ID);

const useNotificationFeed = (knockClient, feedId) => {
  return useMemo(() => {
    // Create the notification feed instance
    const notificationFeed = knockClient.feeds.initialize(feedId, {
      page_size: 10,
      auto_manage_socket_connection: true,
      auto_manage_socket_connection_delay: 500,
    });

    return [notificationFeed, notificationFeed.store];
  }, [knockClient, feedId]);
};

function App() {
  const [status, setStatus] = useState("all");
  const [feedClient, feedStore] = useNotificationFeed(
    knockClient,
    import.meta.env.VITE_KNOCK_CHANNEL_ID,
  );
  const [feedState, setFeedState] = useState(feedStore.getState());

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

  // Initial fetch with status
  useEffect(() => {
    feedClient.fetch({ status });
  }, [status, feedClient]);

  // Consume the store
  useEffect(() => {
    // What to do on updates
    const render = (state) => {
      setFeedState(state);
    };

    // What to do on initial load
    render(feedStore.getInitialState());

    // Subscribe to updates
    feedStore.subscribe(render);
  }, [feedStore]);

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

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const { loading, items, pageInfo } = feedState;

  return (
    <div className="App">
      <h1>Feed items</h1>

      <select value={status} onChange={handleStatusChange}>
        <option value="all">All</option>
        <option value="unread">Unread</option>
        <option value="read">Read</option>
      </select>

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
        onClick={() => feedClient.fetchNextPage({ status })}
      >
        Load more items
      </button>
    </div>
  );
}

export default App;
