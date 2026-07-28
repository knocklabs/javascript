// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import type { Socket } from "phoenix";

import { PageVisibilityManager } from "../src/pageVisibility";

type MockSocket = Socket & {
  isConnected: ReturnType<typeof vi.fn>;
  connect: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
};

function createMockSocket() {
  const openCallbacks: Array<() => void> = [];
  const closeCallbacks: Array<() => void> = [];

  const socket = {
    isConnected: vi.fn(() => true),
    connect: vi.fn(),
    disconnect: vi.fn(),
    onOpen: vi.fn((cb: () => void) => openCallbacks.push(cb)),
    onClose: vi.fn((cb: () => void) => closeCallbacks.push(cb)),
  } as unknown as MockSocket;

  return {
    socket,
    // Simulates the socket successfully opening a connection.
    fireOpen: () => openCallbacks.forEach((cb) => cb()),
    // Simulates the socket's connection closing (e.g. a failed/dropped attempt).
    fireClose: () => closeCallbacks.forEach((cb) => cb()),
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
    const { socket, fireOpen } = createMockSocket();
    const manager = new PageVisibilityManager(socket);
    fireOpen();

    simulateVisibilityChange(true);

    expect(socket.disconnect).not.toHaveBeenCalled();
    vi.advanceTimersByTime(30_000);
    expect(socket.disconnect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("reconnects the socket when page becomes visible after a disconnect", () => {
    const { socket, fireOpen } = createMockSocket();
    const manager = new PageVisibilityManager(socket);
    fireOpen();

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(30_000);

    simulateVisibilityChange(false);
    expect(socket.connect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("parks and resumes a socket that is mid-reconnect (not connected) while hidden", () => {
    const { socket, fireClose } = createMockSocket();
    // Socket is retrying, so it is not currently connected.
    socket.isConnected.mockReturnValue(false);
    const manager = new PageVisibilityManager(socket);
    // A failed/closed attempt still marks the socket as active.
    fireClose();

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(30_000);

    // The retrying socket is parked despite never being "connected", which
    // stops the reconnect loop from running in a hidden background tab.
    expect(socket.disconnect).toHaveBeenCalledOnce();

    simulateVisibilityChange(false);
    expect(socket.connect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("cancels the pending disconnect if the page becomes visible before the delay", () => {
    const { socket, fireOpen } = createMockSocket();
    const manager = new PageVisibilityManager(socket);
    fireOpen();

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(15_000);

    simulateVisibilityChange(false);
    vi.advanceTimersByTime(30_000);

    expect(socket.disconnect).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();

    manager.teardown();
  });

  test("does not park or reconnect a socket that was never activated", () => {
    const { socket } = createMockSocket();
    socket.isConnected.mockReturnValue(false);
    const manager = new PageVisibilityManager(socket);
    // No fireOpen/fireClose: the consumer never opened a connection.

    simulateVisibilityChange(true);
    vi.advanceTimersByTime(30_000);

    simulateVisibilityChange(false);

    expect(socket.disconnect).not.toHaveBeenCalled();
    expect(socket.connect).not.toHaveBeenCalled();

    manager.teardown();
  });

  test("respects a custom disconnect delay", () => {
    const { socket, fireOpen } = createMockSocket();
    const manager = new PageVisibilityManager(socket, 5_000);
    fireOpen();

    simulateVisibilityChange(true);

    vi.advanceTimersByTime(4_999);
    expect(socket.disconnect).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(socket.disconnect).toHaveBeenCalledOnce();

    manager.teardown();
  });

  test("teardown removes the event listener and clears pending timers", () => {
    const { socket, fireOpen } = createMockSocket();
    const manager = new PageVisibilityManager(socket);
    fireOpen();

    simulateVisibilityChange(true);
    manager.teardown();

    vi.advanceTimersByTime(30_000);
    expect(socket.disconnect).not.toHaveBeenCalled();

    // Subsequent visibility changes should have no effect
    simulateVisibilityChange(false);
    expect(socket.connect).not.toHaveBeenCalled();
  });
});
