import {
  Banner,
  Card,
  KnockGuideProvider,
  KnockProvider,
  Modal,
} from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";
import { useState } from "react";
import { Link, Route, Routes } from "react-router";

const Navigation = () => {
  return (
    <nav style={{ display: "flex", gap: "12px" }}>
      <Link to="/">Home</Link>
      <Link to="/produce">Produce</Link>
      <Link to="/meat">Meat</Link>
      <Link to="/seafood">Seafood</Link>
      <Link to="/dairy/butter">Dairy &gt; Butter</Link>
      <Link to="/dairy/cheese">Dairy &gt; Cheese</Link>
      <Link to="/dairy/eggs">Dairy &gt; Eggs</Link>
    </nav>
  );
};

const Page = ({ title }: { title: string }) => <div>Viewing: {title}</div>;

function App() {
  const [colorMode, setColorMode] = useState<"dark" | "light">("light");

  return (
    <KnockProvider
      apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
      user={{ id: import.meta.env.VITE_KNOCK_USER_ID! }}
      host={import.meta.env.VITE_KNOCK_HOST}
      logLevel="debug"
    >
      <KnockGuideProvider
        channelId={import.meta.env.VITE_KNOCK_GUIDE_CHANNEL_ID}
        readyToTarget={true}
        listenForUpdates={true}
        colorMode={colorMode}
      >
        <div style={{ padding: "1rem 2rem" }}>
          <h1>Knock In-App Guide Example</h1>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              height: "20px",
            }}
          >
            <Navigation />
            <button
              onClick={() =>
                setColorMode(colorMode === "dark" ? "light" : "dark")
              }
            >
              Toggle color mode: {colorMode}
            </button>
          </div>

          <div style={{ marginTop: "20px" }} />
          <Banner />
          <div style={{ marginTop: "20px" }} />
          <Card />
          <div style={{ marginTop: "20px" }} />
          <Modal />

          <Routes>
            <Route index element={<Page title="home" />} />
            <Route path="/produce" element={<Page title="Produce" />} />
            <Route path="/meat" element={<Page title="Meat" />} />
            <Route path="/seafood" element={<Page title="Seatfood" />} />
            <Route
              path="/dairy/butter"
              element={<Page title="Dairy &gt; Butter" />}
            />
            <Route
              path="/dairy/cheese"
              element={<Page title="Dairy &gt; Cheese" />}
            />
            <Route
              path="/dairy/eggs"
              element={<Page title="Dairy &gt; Eggs" />}
            />
          </Routes>
        </div>
      </KnockGuideProvider>
    </KnockProvider>
  );
}

export default App;
