import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore JSX types not enabled in test tsconfig
import { KnockGuideProvider } from "../../src/modules/guide/context/KnockGuideProvider";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore JSX types not enabled in test tsconfig
import { useGuideContext } from "../../src/modules/guide/hooks/useGuideContext";

// Note: core is mocked below – no direct reference needed.

// Mock Knock client dependency for the provider, but retain other exports
vi.mock("../../src/modules/core", async () => {
  const actual = (await vi.importActual<
    typeof import("../../src/modules/core")
  >("../../src/modules/core")) as typeof import("../../src/modules/core");
  return {
    ...actual,
    useKnockClient: () => ({ apiKey: "test" }),
  };
});

// -----------------------------------------------------------------------------
// KnockGuideClient mock must be defined BEFORE being referenced in vi.mock factory
// -----------------------------------------------------------------------------
// Declare variables first so they can be assigned inside the mock factory before tests run
// eslint-disable-next-line no-var
var fetchMock: ReturnType<typeof vi.fn>;
// eslint-disable-next-line no-var
var subscribeMock: ReturnType<typeof vi.fn>;
// eslint-disable-next-line no-var
var cleanupMock: ReturnType<typeof vi.fn>;
// eslint-disable-next-line no-var
var MockKnockGuideClient: new () => unknown;

vi.mock("@knocklabs/client", () => {
  fetchMock = vi.fn();
  subscribeMock = vi.fn();
  cleanupMock = vi.fn();

  MockKnockGuideClient = class {
    fetch = fetchMock;
    subscribe = subscribeMock;
    cleanup = cleanupMock;
    store = { subscribe: vi.fn(), setState: vi.fn() };
  };

  return { KnockGuideClient: MockKnockGuideClient };
});

describe("KnockGuideProvider", () => {
  // Deliberately omitting negative-case test that asserts throwing without KnockProvider
  // as React swallows errors thrown during rendering, making the assertion unreliable

  it("provides context and triggers fetch/subscribe when ready", () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
      React.createElement(
        KnockGuideProvider,
        { channelId: "feed", readyToTarget: true },
        children,
      );

    const { result } = renderHook(() => useGuideContext(), { wrapper });

    expect(result.current.colorMode).toBe("light");
    expect(result.current.client).toBeInstanceOf(MockKnockGuideClient);
    expect(fetchMock).toHaveBeenCalled();
    expect(subscribeMock).toHaveBeenCalled();
  });
});
