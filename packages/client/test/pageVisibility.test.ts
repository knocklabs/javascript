// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Socket } from "phoenix";

import { PageVisibilityManager } from "../src/pageVisibility";

function createMockSocket() {
  return {
    isConnected: vi.fn(() => true),
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as Socket & {
    isConnected: ReturnType<typeof vi.fn>;
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
}

function simulateVisibilityChange(hidden: boolean) {
  Object.defineProperty(document, "hidden", {
    value: hidden,
    writable: true,
    configurable: true,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("PageVisibilityManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("disconnects the socket after the delay when page becomes hidden", () => {
    const socket = createMockSocket();
    const manager = new PageVisibilityManager(socket);

    simulateVisibilityChange(true);

    expect(socket.disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(socket.disconnect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("reconnects the socket when page becomes visible after a disconnect", () => {
    const socket = createMockSocket();
    const manager = new PageVisibilityManager(socket);

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(30_000);

    simulateVisibilityChange(false);
    expect(socket.connect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("cancels the pending disconnect if the page becomes visible before the delay", () => {
    const socket = createMockSocket();
    const manager = new PageVisibilityManager(socket);

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(15_000);

    simulateVisibilityChange(false);
    vi.advanceTimersByTime(30_000);

    expect(socket.disconnect).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();

    manager.teardown();
  });

  test("does not reconnect if the socket was not connected when hidden", () => {
    const socket = createMockSocket();
    socket.isConnected.mockReturnValue(false);
    const manager = new PageVisibilityManager(socket);

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(30_000);

    simulateVisibilityChange(false);

    expect(socket.disconnect).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();

    manager.teardown();
  });

  test("respects a custom disconnect delay", () => {
    const socket = createMockSocket();
    const manager = new PageVisibilityManager(socket, 5_000);

    simulateVisibilityChange(true);

    vi.advanceTimersByTime(4_999);
    expect(socket.disconnect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(socket.disconnect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("teardown removes the event listener and clears pending timers", () => {
    const socket = createMockSocket();
    const manager = new PageVisibilityManager(socket);

    simulateVisibilityChange(true);
    manager.teardown();

    vi.advanceTimersByTime(30_000);
    expect(socket.disconnect).not.toHaveBeenCalled();

    // Subsequent visibility changes should have no effect
    simulateVisibilityChange(false);
    expect(socket.connect).not.toHaveBeenCalled();
  });
});
