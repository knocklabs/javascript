import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeed,
} from "@knocklabs/react";
import { render } from "@testing-library/react";
import { version } from "react";
import { describe, it } from "vitest";

const Feed = () => {
  console.log("VERSION", version);
  return (
    <KnockProvider
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID}>
        <NotificationFeed />
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("NotificationFeed", () => {
  it("should render", () => {
    render(<Feed />);
  });
});
