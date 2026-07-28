import Knock from "@knocklabs/client";
import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useKnockAuthState } from "../../src";

describe("useKnockAuthState", () => {
  it("returns the unauthenticated state before authentication", () => {
    const knock = new Knock("pk_test_12345");

    const { result } = renderHook(() => useKnockAuthState(knock));

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.userId).toBeUndefined();
  });

  it("re-renders with the authenticated state on login and clears it on logout", () => {
    const knock = new Knock("pk_test_12345");

    const { result } = renderHook(() => useKnockAuthState(knock));

    act(() => {
      knock.authenticate("user_123", "token_456");
    });

    expect(result.current.status).toBe("authenticated");
    expect(result.current.userId).toBe("user_123");
    expect(result.current.userToken).toBe("token_456");

    act(() => {
      knock.logout();
    });

    expect(result.current.status).toBe("unauthenticated");
    expect(result.current.userId).toBeUndefined();
  });
});
