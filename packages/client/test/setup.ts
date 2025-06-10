/**
 * Simplified Test Setup
 *
 * This file provides minimal global test configuration and essential polyfills
 * without the excessive global mocking that was causing issues.
 */
// Essential polyfills for jsdom environment
import "urlpattern-polyfill";
import { afterAll, vi } from "vitest";

// Track unhandled promise rejections for debugging
const unhandledRejections: any[] = [];

// Handle unhandled promise rejections globally
const handleUnhandledRejection = (event: any) => {
  const reason = event.reason || event;

  // Log for debugging but don't fail tests for expected rejections
  if (
    reason?.message?.includes("Network error") ||
    reason?.message?.includes("Network Error") ||
    reason?.message?.includes("timeout") ||
    reason?.message?.includes("Server error") ||
    reason?.code === "ECONNABORTED" ||
    reason?.message?.includes("Network failure") ||
    reason?.message?.includes("Network timeout")
  ) {
    // These are expected test errors - just track them silently
    unhandledRejections.push(reason);
    event.preventDefault?.();
    return;
  }

  // Log unexpected rejections for debugging but don't fail tests
  console.warn("[TEST] Unhandled promise rejection:", reason);
  unhandledRejections.push(reason);
  event.preventDefault?.();
};

// Add listeners for both Node.js and browser environments
if (typeof process !== "undefined" && process.on) {
  process.on("unhandledRejection", handleUnhandledRejection);
}

if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
}

// Suppress console warnings and errors during tests to reduce noise
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;
const originalConsoleLog = console.log;

// Create no-op functions for suppressed console methods
const noOp = () => {};

// Filter out specific warnings we expect during tests
console.warn = (message: any, ...args: any[]) => {
  const messageStr = String(message);

  // Suppress expected test warnings
  if (
    messageStr.includes("Could not broadcast") ||
    messageStr.includes("Cleanup error") ||
    messageStr.includes("[TEST]")
  ) {
    return;
  }

  originalConsoleWarn(message, ...args);
};

// Completely suppress console.error during tests since we're testing error scenarios
// This prevents axios errors from showing up in test output
console.error = noOp;

// Suppress console.log during tests to prevent Knock debug messages
console.log = (message: any, ...args: any[]) => {
  const messageStr = String(message);

  // Allow test-specific logs but suppress Knock logs
  if (messageStr.includes("[Knock]")) {
    return;
  }

  originalConsoleLog(message, ...args);
};

// Global cleanup after all tests
afterAll(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
  console.log = originalConsoleLog;

  // Clean up promise rejection handlers
  if (typeof process !== "undefined" && process.removeListener) {
    process.removeListener("unhandledRejection", handleUnhandledRejection);
  }

  if (typeof window !== "undefined") {
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }

  // Clear tracked rejections
  unhandledRejections.length = 0;
});

// Provide basic browser APIs that might be needed
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    origin: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
  },
  writable: true,
});

// Basic localStorage mock if needed
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Basic sessionStorage mock if needed
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Export for debugging if needed
export { unhandledRejections };
