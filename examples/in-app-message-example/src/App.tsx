import { CommonContentField, NetworkStatus } from "@knocklabs/client";
import {
  KnockInAppMessageChannelProvider,
  KnockProvider,
  useInAppMessage,
  useInAppMessages,
} from "@knocklabs/react";
import { useState } from "react";

function Message() {
  const [messageType, setMessageType] = useState("card");

  const { message, loading, networkStatus } = useInAppMessage(messageType);

  return (
    <>
      <h2>Message</h2>
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
        {message?.message_type === "banner" ? (
          <div className="banner" key={message.id}>
            <h2>{(message.content.title as CommonContentField).rendered}</h2>
            <p>{(message.content.body as CommonContentField).rendered}</p>
            {(message.content.dismissible as CommonContentField).value && (
              <button>Dismiss</button>
            )}
          </div>
        ) : message?.message_type === "card" ? (
          <div className="card" key={message.id}>
            <h2>{(message.content.heading as CommonContentField).rendered}</h2>
            {/* @ts-expect-error Need to type */}
            <a href={message.content.action.action.rendered}>
              {/* @ts-expect-error Need to type */}
              {message.content.action.text.rendered}
            </a>
          </div>
        ) : (
          <pre key={message?.id}>
            {JSON.stringify({ content: message?.content }, null, 2)}
          </pre>
        )}
      </div>
    </>
  );
}

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
                <h2>{(content.title as CommonContentField).rendered}</h2>
                <p>{(content.body as CommonContentField).rendered}</p>
                {(content.dismissible as CommonContentField).value && (
                  <button>Dismiss</button>
                )}
              </div>
            );
          } else if (message_type === "card") {
            return (
              <div className="card" key={id}>
                <h2>{(content.heading as CommonContentField).rendered}</h2>
                {/* @ts-expect-error Need to type */}
                <a href={content.action.action.rendered}>
                  {/* @ts-expect-error Need to type */}
                  {content.action.text.rendered}
                </a>
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

function App() {
  return (
    <KnockProvider
      apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
      userId={import.meta.env.VITE_KNOCK_USER_ID!}
      host={import.meta.env.VITE_KNOCK_HOST}
    >
      <KnockInAppMessageChannelProvider
        channelId={import.meta.env.VITE_KNOCK_CHANNEL_ID}
      >
        <>
          <h1>Knock In-App Message Example</h1>
          <hr />
          <Message />
          <hr />
          <Messages />
          <hr />
          <h2>Env</h2>
          <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
        </>
      </KnockInAppMessageChannelProvider>
    </KnockProvider>
  );
}

export default App;
