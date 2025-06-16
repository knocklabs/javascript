import { KnockFeedProvider, KnockProvider, MarkAsRead } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

const Wrapper = () => (
  <KnockProvider
    apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
    userId={process.env.INTEGRATION_KNOCK_USER_ID}
  >
    <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
      <MarkAsRead onClick={() => {}} />
    </KnockFeedProvider>
  </KnockProvider>
);

describe("MarkAsRead", () => {
  it("renders without crashing", () => {
    render(<Wrapper />);
  });
}); 