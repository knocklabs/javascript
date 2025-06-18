import { KnockFeedProvider, KnockProvider } from "@knocklabs/react";
import { NotificationFeedHeader } from "@knocklabs/react";
import { render } from "@testing-library/react";
import React from "react";
import { describe, it } from "vitest";
import { FilterStatus } from "@knocklabs/react-core";

// We need provider context because Dropdown uses useKnockFeed for colorMode.
const HeaderWrapper: React.FC<{ onStatusChange: (status: FilterStatus) => void }> = ({ onStatusChange }) => {
  const [status, setStatus] = React.useState(FilterStatus.All);

  React.useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  return (
    <KnockProvider
      apiKey={process.env.INTEGRATION_KNOCK_PUBLIC_KEY}
      userId={process.env.INTEGRATION_KNOCK_USER_ID}
    >
      <KnockFeedProvider feedId={process.env.INTEGRATION_KNOCK_FEED_ID!}>
        <NotificationFeedHeader filterStatus={status} setFilterStatus={setStatus} />
      </KnockFeedProvider>
    </KnockProvider>
  );
};

describe("NotificationFeedHeader", () => {
  it("renders without crashing", () => {
    render(<HeaderWrapper onStatusChange={() => {}} />);
  });
}); 