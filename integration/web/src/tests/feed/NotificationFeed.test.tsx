import {
  KnockFeedProvider,
  KnockProvider,
  NotificationFeed,
} from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, test } from "vitest";

type FeedProps = {
  apiKey: string;
  userId: string;
  feedId: string;
};

const Feed = ({ apiKey, userId, feedId }: FeedProps) => {
  return (
    <KnockProvider apiKey={apiKey} userId={userId}>
      <KnockFeedProvider feedId={feedId}>
        <NotificationFeed />
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("NotificationFeed", () => {
  test("should render", () => {
    render(<Feed apiKey="apiKey" userId="userId" feedId="feedId" />);
  });
});
