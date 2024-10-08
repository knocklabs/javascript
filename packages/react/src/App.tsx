import {
  Button,
  ButtonGroup,
  Card,
  KnockFeedProvider,
  KnockInAppChannelProvider,
  KnockProvider,
  Modal,
} from ".";
import { FunctionComponent, useState } from "react";

import "./theme.css";

// Test out components here by running yarn dev:local in the package
const App: FunctionComponent = () => {
  const [colorMode, setColorMode] = useState<"dark" | "light">("light");

  return (
    <div>
      <KnockProvider apiKey={""} userId={""}>
        <h1>@knocklabs/react playground</h1>

        <KnockInAppChannelProvider channelId={""} colorMode={colorMode}>
          <button
            onClick={() =>
              setColorMode(colorMode === "dark" ? "light" : "dark")
            }
          >
            Toggle color mode - {colorMode}
          </button>
          <Modal.View.Default
            colorMode={colorMode}
            content={{
              title: "Modal title",
              body: "Contextual copy about what is being shown in the Modal. Use modals for announcements, timely updates, and messages with important calls to action.",
              dismissible: true,
              primary_button: {
                text: "Primary",
                action: "",
              },
              secondary_button: {
                text: "Secondary",
                action: "",
              },
            }}
          />

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
        </KnockInAppChannelProvider>
        <KnockFeedProvider feedId={""}>
          <section style={{ marginTop: 24 }}>
            <h2>Buttons</h2>
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={() => {
                  console.log("Clicked!");
                }}
              >
                Primary
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  console.log("Clicked!");
                }}
              >
                Secondary
              </Button>
            </ButtonGroup>
          </section>
        </KnockFeedProvider>
      </KnockProvider>
    </div>
  );
};

export default App;
