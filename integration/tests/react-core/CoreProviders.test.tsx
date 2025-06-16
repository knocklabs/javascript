import {
  KnockProvider,
  KnockFeedProvider,
  KnockGuideProvider,
} from "@knocklabs/react-core";
import { render } from "@testing-library/react";
import { describe, it  } from "vitest";


describe("react-core providers render", () => {
  it("KnockProvider renders", () => {
    render(
      <KnockProvider apiKey="test" userId="user">
        <div>content</div>
      </KnockProvider>,
    );
  });

  it("KnockFeedProvider renders", () => {
    render(
      <KnockProvider apiKey="test" userId="user">
        <KnockFeedProvider feedId="feed">
          <div>feed</div>
        </KnockFeedProvider>
      </KnockProvider>,
    );
  });

  it("KnockGuideProvider renders", () => {
    render(
      <KnockProvider apiKey="test" userId="user">
        <KnockGuideProvider channelId="channel" readyToTarget={false}>
          <div>guide</div>
        </KnockGuideProvider>
      </KnockProvider>,
    );
  });
}); 