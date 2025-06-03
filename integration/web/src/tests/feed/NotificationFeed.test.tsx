import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeed,
} from "@knocklabs/react";
import { render } from "@testing-library/react";
import { useId } from "react";
import { describe, it } from "vitest";

const Feed = () => {
  const id = useId();
  return (
    <KnockProvider
      // eslint-disable-next-line
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      // eslint-disable-next-line
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      {/* eslint-disable-next-line */}
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
