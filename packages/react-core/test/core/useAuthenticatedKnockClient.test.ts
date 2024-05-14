import Knock from "@knocklabs/client";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useAuthenticatedKnockClient } from "../../src";
import { AuthenticatedKnockClientOptions } from "../../src/modules/core/hooks/useAuthenticatedKnockClient";

const defaultProps: {
  apiKey: string;
  userId: string;
  userToken?: string;
  options?: AuthenticatedKnockClientOptions;
} = {
  apiKey: "pk_1234",
  userId: "user_123",
  userToken: undefined,
  options: undefined,
};

describe("useAuthenticatedKnockClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create a new knock client instance", () => {
    const { result } = renderHook(
      ({ apiKey, userId, userToken, options }) =>
        useAuthenticatedKnockClient(apiKey, userId, userToken, options),
      { initialProps: defaultProps },
    );

    expect(result.current).toBeInstanceOf(Knock);
    expect(result.current.userId).toEqual("user_123");
  });

  it("should not create a new instance when the userId is stable during re-renders", () => {
    const { result, rerender } = renderHook(
      ({ apiKey, userId, userToken, options }) =>
        useAuthenticatedKnockClient(apiKey, userId, userToken, options),
      { initialProps: defaultProps },
    );

    const authenticateSpy = vi.spyOn(result.current, "authenticate");

    expect(result.current).toBeInstanceOf(Knock);
    expect(result.current.userId).toEqual("user_123");

    rerender(defaultProps);

    expect(authenticateSpy).not.toBeCalled();
  });

  it("should reauthenticate when the userId or userToken changes", () => {
    const { result, rerender } = renderHook(
      ({ apiKey, userId, userToken, options }) =>
        useAuthenticatedKnockClient(apiKey, userId, userToken, options),
      { initialProps: defaultProps },
    );

    expect(result.current).toBeInstanceOf(Knock);
    expect(result.current.userId).toEqual("user_123");

    const authenticateSpy = vi.spyOn(result.current, "authenticate");

    // Change the user id
    rerender({ ...defaultProps, userId: "user_2345" });

    expect(result.current.userId).toEqual("user_2345");
    expect(authenticateSpy).toBeCalled();

    // Change the user token
    rerender({ ...defaultProps, userToken: "token_1234" });

    expect(result.current.userToken).toEqual("token_1234");
    expect(authenticateSpy).toBeCalled();
  });

  it("should create a new instance when the api key changes", () => {
    const { result, rerender } = renderHook(
      ({ apiKey, userId, userToken, options }) =>
        useAuthenticatedKnockClient(apiKey, userId, userToken, options),
      { initialProps: defaultProps },
    );

    expect(result.current).toBeInstanceOf(Knock);

    const teardownSpy = vi.spyOn(result.current, "teardown");

    rerender({ ...defaultProps, apiKey: "pk_23456" });

    expect(teardownSpy).toHaveBeenCalledOnce();
  });

  it("should create a new instance when the options change", () => {
    const { result, rerender } = renderHook(
      ({ apiKey, userId, userToken, options }) =>
        useAuthenticatedKnockClient(
          apiKey,
          userId,
          userToken,
          options as AuthenticatedKnockClientOptions,
        ),
      {
        initialProps: {
          ...defaultProps,
          options: { logLevel: "debug" } as AuthenticatedKnockClientOptions,
        },
      },
    );

    expect(result.current).toBeInstanceOf(Knock);
    expect(result.current.logLevel).toEqual("debug");

    const teardownSpy = vi.spyOn(result.current, "teardown");

    // Change options and we should teardown and re-render
    rerender({
      ...defaultProps,
      options: { host: "https://whatever.com", logLevel: "debug" },
    });

    expect(teardownSpy).toHaveBeenCalledOnce();

    expect(result.current).toBeInstanceOf(Knock);
  });
});
