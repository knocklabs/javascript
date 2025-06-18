import { KnockFeedProvider, KnockProvider, NotificationIconButton } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

const IconButtonExample = ({ onClick }: { onClick: () => void }) => {
  return (
    <KnockProvider
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
        <NotificationIconButton onClick={onClick} />
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("NotificationIconButton", () => {
  it("renders without crashing", () => {
    render(<IconButtonExample onClick={() => {}} />);
  });
}); 