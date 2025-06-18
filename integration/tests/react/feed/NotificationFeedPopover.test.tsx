import { KnockFeedProvider, KnockProvider, NotificationFeedPopover } from "@knocklabs/react";
import { render } from "@testing-library/react";
import React from "react";
import { describe, it } from "vitest";

const PopoverExample: React.FC = () => {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = React.useState(true);

  return (
    <KnockProvider
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
        <button ref={buttonRef}>anchor</button>
        <NotificationFeedPopover
          isVisible={isVisible}
          onClose={() => setIsVisible(false)}
          buttonRef={buttonRef}
        />
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("NotificationFeedPopover", () => {
  it("should render without crashing", () => {
    render(<PopoverExample />);
  });
}); 