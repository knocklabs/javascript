import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Card } from "../../src/modules/guide/components/Card/Card";

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useGuide: () => ({
      colorMode: "dark",
      guide: { id: "g1" },
      step: {
        content: {
          headline: "Heads up!",
          title: "Quick Tip",
          body: "Use our API",
          dismissible: false,
        },
        markAsSeen: vi.fn(),
        markAsArchived: vi.fn(),
      },
    }),
  };
});

describe("Card", () => {
  test("renders headline and title", () => {
    const { getByText } = render(<Card />);
    expect(getByText("Heads up!")).toBeInTheDocument();
    expect(getByText("Quick Tip")).toBeInTheDocument();
  });
});
