import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Card, CardView } from "../../src/modules/guide/components/Card/Card";

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

  test("CardView.Img renders a void img with no children", () => {
    const { getByAltText } = render(
      <CardView.Img src="https://example.com/image.png" alt="Example image" />,
    );
    const img = getByAltText("Example image");
    expect(img.tagName).toBe("IMG");
    expect(img).toHaveClass("knock-guide-card__img");
    expect(img).toBeEmptyDOMElement();
  });
});
