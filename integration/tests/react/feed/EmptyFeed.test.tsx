import { KnockFeedProvider, KnockProvider, EmptyFeed } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

const EmptyFeedExample = () => {
  return (
    <KnockProvider
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
        <EmptyFeed />
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("EmptyFeed", () => {
  it("renders without crashing", () => {
    render(<EmptyFeedExample />);
  });
}); 