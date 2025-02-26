import {
  Banner,
  Card,
  Modal,
  KnockGuideProvider,
  KnockProvider,
} from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";
import { useState } from "react";

function App() {
  const [colorMode, setColorMode] = useState<"dark" | "light">("light");

  return (
    <KnockProvider
      apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
      userId={import.meta.env.VITE_KNOCK_USER_ID!}
      host={import.meta.env.VITE_KNOCK_HOST}
      logLevel="debug"
    >
      <KnockGuideProvider
        channelId={import.meta.env.VITE_KNOCK_GUIDE_CHANNEL_ID}
        readyToTarget={true}
        colorMode={colorMode}
      >
        <div style={{ padding: "1rem 2rem" }}>
          <h1>Knock Guide Example</h1>
          <button
            onClick={() =>
              setColorMode(colorMode === "dark" ? "light" : "dark")
            }
          >
            Toggle color mode: {colorMode}
          </button>

          <div style={{ marginTop: "20px" }} />
          <Banner />
          <div style={{ marginTop: "20px" }} />
          <Card />
          <div style={{ marginTop: "20px" }} />
          <Modal />
        </div>
      </KnockGuideProvider>
    </KnockProvider>
  );
}

export default App;
