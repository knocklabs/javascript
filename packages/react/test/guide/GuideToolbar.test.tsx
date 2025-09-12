import { fireEvent, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { GuideToolbar } from "../../src/modules/guide/components/GuideToolbar/GuideToolbar";

const mockDebugState: { forcedGuideKey: string | null } = {
  forcedGuideKey: "test-guide-key",
};

const mockGuideContext = {
  client: {
    stage: {},
    store: {},
  },
  colorMode: "light",
};

vi.mock("@tanstack/react-store", () => ({
  useStore: vi.fn((_store, selector) => {
    return selector({ debug: mockDebugState });
  }),
}));

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useGuideContext: () => mockGuideContext,
  };
});

describe("GuideToolbar", () => {
  test("renders debug component when forcedGuideKey exists", () => {
    mockDebugState.forcedGuideKey = "test-guide-key";

    const { getByText } = render(<GuideToolbar />);
    expect(getByText("Debug")).toBeInTheDocument();
    expect(getByText("test-guide-key")).toBeInTheDocument();
    expect(getByText("Exit")).toBeInTheDocument();
  });

  test("does not render when forcedGuideKey is null", () => {
    mockDebugState.forcedGuideKey = null;

    const { container } = render(<GuideToolbar />);
    expect(container.firstChild).toBeNull();
  });

  test("clicking exit removes knock_guide_key from URL", () => {
    const originalLocation = window.location;
    const mockLocation = {
      href: "https://example.com/page?knock_guide_key=test-guide&other_param=value",
      toString: () =>
        "https://example.com/page?knock_guide_key=test-guide&other_param=value",
    };

    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    mockDebugState.forcedGuideKey = "test-guide-key";

    const { getByText } = render(<GuideToolbar />);

    const exitButton = getByText("Exit");
    fireEvent.click(exitButton);

    expect(mockLocation.href).toBe(
      "https://example.com/page?other_param=value",
    );

    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });

  test("renders guide missing when the forced guide key is not in the stage", () => {
    mockDebugState.forcedGuideKey = "test-guide-key";

    mockGuideContext.client.stage = {
      status: "closed",
      ordered: ["site-banner"],
      timeoutId: null,
      resolved: "site-banner",
    };

    const { getByText } = render(<GuideToolbar />);
    expect(
      getByText("Selected guide is not rendered on this page"),
    ).toBeInTheDocument();
  });
});
