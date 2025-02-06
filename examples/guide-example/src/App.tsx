import {
  Banner,
  // CardView,
  KnockGuideProvider,
  KnockProvider,
  //useGuide,
  // ModalView,
} from "@knocklabs/react";
import "@knocklabs/react/dist/index.css";
import { useState } from "react";

//const Banner = () => {
//  const { guides, colorMode } = useGuides("card");
//  const [guide] = guides;
//
//  if (!guide) return null;
//
//  return (
//    <CardView.Default
//      colorMode={colorMode}
//      content={{
//        title: guide.content.title,
//        body: guide.content.body,
//        dismissible: !!guide.content.dismissible,
//      }}
//    />
//  )
//}

function App() {
  const [colorMode, setColorMode] = useState<"dark" | "light">("dark");

  return (
    <KnockProvider
      apiKey={import.meta.env.VITE_KNOCK_API_KEY!}
      userId={import.meta.env.VITE_KNOCK_USER_ID!}
      host={import.meta.env.VITE_KNOCK_HOST}
      logLevel="debug"
    >
      <KnockGuideProvider
        colorMode={colorMode}
      >
        <>
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
        </>
      </KnockGuideProvider>
    </KnockProvider>
  );
}

export default App;
