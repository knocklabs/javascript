import { NetworkStatus } from "@knocklabs/client";
import {
  Banner,
  KnockInAppChannelProvider,
  KnockProvider,
  useInAppMessages,
} from "@knocklabs/react";
import { useInAppMessage } from "@knocklabs/react-core";
import "@knocklabs/react/dist/index.css";
import { useState } from "react";

function Messages() {
  const [messageType, setMessageType] = useState("banner");

  const { messages, loading, networkStatus } = useInAppMessages(messageType);

  return (
    <>
      <h2>Messages</h2>
      <div
        style={{ height: 24, display: "flex", justifyContent: "space-between" }}
      >
        <select
          value={messageType}
          onChange={(e) => setMessageType(e.currentTarget.value)}
        >
          <option value="banner">Banner</option>
          <option value="card">Card</option>
        </select>
        {(loading || networkStatus === NetworkStatus.loading) && (
          <div>Loading...</div>
        )}
      </div>
      <div>
        {messages.map(({ id, content, message_type }) => {
          if (message_type === "banner") {
            return (
              <div className="banner" key={id}>
                <h2>{content.title}</h2>
                <p>{content.body}</p>
                {content.dismissible && <button>Dismiss</button>}
              </div>
            );
          } else if (message_type === "card") {
            return (
              <div className="card" key={id}>
                <h2>{content.heading}</h2>
                <a href={content.action.action}>{content.action.text}</a>
              </div>
            );
          } else {
            return <pre key={id}>{JSON.stringify(content, null, 2)}</pre>;
          }
        })}
      </div>
    </>
  );
}

const Card = (opts: any) => {
  const [counter, setCounter] = useState(0);
  const { message } = useInAppMessage("card", opts);

  if (!message) return null;

  return (
    <div>
      Card: {JSON.stringify(opts)}

      <button onClick={() => setCounter(counter + 1)}>
        click
      </button>
    </div>
  )
}

function App() {
  return (
    <KnockProvider
      apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
      userId={import.meta.env.VITE_KNOCK_USER_ID!}
      host={import.meta.env.VITE_KNOCK_HOST}
    >
      <KnockInAppChannelProvider
        channelId={import.meta.env.VITE_KNOCK_CHANNEL_ID}
      >
        <>
          <h1>Knock In-App Message Example</h1>
          <hr />
          <h2>Card</h2>
          <Card trigger_data={JSON.stringify({seven: "seven"})} />
          <Card trigger_data={JSON.stringify({eight: "eight"})} />
          <Card trigger_data={JSON.stringify({nine: "nine"})} />
          <Card workflow_key="hello" />
          <hr />
          <h2>Env</h2>
          <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
          <input type="text" />
        </>
      </KnockInAppChannelProvider>
    </KnockProvider>
  );
}

export default App;
