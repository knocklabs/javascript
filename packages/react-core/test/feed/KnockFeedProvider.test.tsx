import React from "react";
import { describe, test, expect } from "vitest";
import { render } from "@testing-library/react";
import { KnockFeedProvider, KnockProvider, useKnockFeed } from "../../src";

describe("KnockFeedProvider", () => {
  test("renders as expected", () => {
    const TestConsumer = () => {
      const { colorMode } = useKnockFeed();

      return <div data-testid="consumer-msg">Color Mode: {colorMode}</div>;
    };
    const { getByTestId } = render(
      <KnockProvider apiKey="test_api_key" userId="test_user_id">
        <KnockFeedProvider feedId="feedId" colorMode="dark">
          <TestConsumer />
        </KnockFeedProvider>
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent("Color Mode: dark");
  });
});
