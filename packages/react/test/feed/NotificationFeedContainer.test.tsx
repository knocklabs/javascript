import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { NotificationFeedContainer } from "../../src/modules/feed/components/NotificationFeedContainer/NotificationFeedContainer";

describe("NotificationFeedContainer", () => {
  test("wraps children and applies correct class", () => {
    const { getByText, container } = render(
      <NotificationFeedContainer>
        <p>Hello</p>
      </NotificationFeedContainer>,
    );

    expect(container.querySelector(".rnf-feed-provider")).toBeInTheDocument();
    expect(getByText("Hello")).toBeInTheDocument();
  });
});
