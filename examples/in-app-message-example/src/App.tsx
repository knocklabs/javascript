import { NetworkStatus } from "@knocklabs/client";
import {
  Banner,
  Card,
  KnockInAppChannelProvider,
  KnockProvider,
  useInAppMessages,
} from "@knocklabs/react";
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

function App() {
  const [colorMode, setColorMode] = useState<"dark" | "light">("dark");

  return (
    <KnockProvider
      apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
      userId={import.meta.env.VITE_KNOCK_USER_ID!}
      host={import.meta.env.VITE_KNOCK_HOST}
    >
      <KnockInAppChannelProvider
        channelId={import.meta.env.VITE_KNOCK_CHANNEL_ID}
        colorMode={colorMode}
      >
        <>
          <h1>Knock In-App Message Example</h1>
          <button
            onClick={() =>
              setColorMode(colorMode === "dark" ? "light" : "dark")
            }
          >
            Toggle color mode
          </button>
          <hr />
          <h2>Banner</h2>
          <Banner.Default />
          <hr />
          <h2>Card</h2>
          <Card.View.Default
            colorMode={colorMode}
            content={{
              headline: "Something new",
              title: "Check out what we're cooking!",
              body: "The greatest enterprise software to grace your procurement pipeline.",
              dismissible: true,
              primary_button: {
                text: "Upgrade $$$$",
                action: "",
              },
              secondary_button: {
                text: "Upgrade a little $$",
                action: "",
              },
            }}
          />
          <hr />
          <Messages />
        </>
      </KnockInAppChannelProvider>
    </KnockProvider>
  );
}

export default App;
