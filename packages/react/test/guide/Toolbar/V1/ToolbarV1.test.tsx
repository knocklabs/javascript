import "@testing-library/jest-dom/vitest";
import { fireEvent, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { ToolbarV1 } from "../../../../src/modules/guide/components/Toolbar";

const mockDebugState: { forcedGuideKey: string | null } = {
  forcedGuideKey: "test-guide-key",
};

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useGuideContext: () => ({
      client: {
        store: {},
        exitDebugMode: vi.fn(() => {
          // Mock the URL parameter removal behavior
          const url = new URL(window.location.href);
          url.searchParams.delete("knock_guide_key");
          url.searchParams.delete("knock_preview_session_id");
          // Update the mocked location href
          window.location.href = url.toString();
        }),
      },
      colorMode: "light",
    }),
    useStore: vi.fn((_store, selector) => {
      return selector({ debug: mockDebugState });
    }),
  };
});

describe("ToolbarV1", () => {
  test("renders debug component when forcedGuideKey exists", () => {
    mockDebugState.forcedGuideKey = "test-guide-key";

    const { getByText } = render(<ToolbarV1 />);
    expect(getByText("Debug")).toBeInTheDocument();
    expect(getByText("test-guide-key")).toBeInTheDocument();
    expect(getByText("Exit")).toBeInTheDocument();
  });

  test("does not render when forcedGuideKey is null", () => {
    mockDebugState.forcedGuideKey = null;

    const { container } = render(<ToolbarV1 />);
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

    const { getByText } = render(<ToolbarV1 />);

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
});
