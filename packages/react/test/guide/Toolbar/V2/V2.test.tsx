import { render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { V2 } from "../../../../src/modules/guide/components/Toolbar/V2/V2";

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useGuideContext: () => ({
      client: {
        store: { state: {} },
        setDebug: vi.fn(),
        unsetDebug: vi.fn(),
      },
    }),
  };
});

vi.mock(
  "../../../../src/modules/guide/components/Toolbar/V2/useInspectGuideClientStore",
  async () => {
    const actual = await vi.importActual(
      "../../../../src/modules/guide/components/Toolbar/V2/useInspectGuideClientStore",
    );
    return {
      ...actual,
      useInspectGuideClientStore: () => null,
    };
  },
);

const getStyleElement = () =>
  document.getElementById("knock-guide-toolbar-styles");

afterEach(() => {
  getStyleElement()?.remove();
  window.history.replaceState({}, "", "/");
});

describe("Toolbar V2", () => {
  test("injects toolbar styles when launched via the toolbar url param", () => {
    window.history.replaceState({}, "", "/?knock_guide_toolbar=true");

    render(<V2 readyToTarget={false} listenForUpdates={false} />);

    expect(getStyleElement()).not.toBeNull();
    expect(getStyleElement()?.parentElement).toBe(document.head);
  });

  test("does not inject toolbar styles without the toolbar url param", () => {
    render(<V2 readyToTarget={false} listenForUpdates={false} />);

    expect(getStyleElement()).toBeNull();
  });
});
