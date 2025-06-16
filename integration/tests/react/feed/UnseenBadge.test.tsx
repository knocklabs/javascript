import { KnockFeedProvider, KnockProvider, UnseenBadge } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

const Wrapper = () => (
  <KnockProvider
    apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
    userId={process.env.INTEGRATION_KNOCK_USER_ID}
  >
    <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
      <UnseenBadge />
    </KnockFeedProvider>
  </KnockProvider>
);

describe("UnseenBadge", () => {
  it("renders without crashing", () => {
    render(<Wrapper />);
  });
}); 