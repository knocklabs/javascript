import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { KnockProvider, useKnockClient } from "../../src";

describe("KnockProvider", () => {
  test("renders as expected", () => {
    const TestConsumer = () => {
      const knock = useKnockClient();

      return <div data-testid="consumer-msg">API Key: {knock.apiKey}</div>;
    };
    const { getByTestId } = render(
      <KnockProvider apiKey="test_api_key" userId="test_user_id">
        <TestConsumer />
      </KnockProvider>,
    );

    expect(getByTestId("consumer-msg")).toHaveTextContent(
      "API Key: test_api_key",
    );
  });
});
