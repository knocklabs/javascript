import { KnockFeedProvider, KnockProvider, NotificationFeedContainer } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

const ContainerExample = () => {
  return (
    <KnockProvider
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
        <NotificationFeedContainer>
          <div>test-content</div>
        </NotificationFeedContainer>
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("NotificationFeedContainer", () => {
  it("should render its children", () => {
    render(<ContainerExample />);
  });
}); 