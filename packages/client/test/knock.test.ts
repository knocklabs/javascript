// @vitest-environment node
import { generateKeyPairSync } from "crypto";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Knock from "../src/knock";

describe("it can create a Knock client", () => {
  test("it sets configuration values", () => {
    const knock = new Knock("pk_test_12345");

    expect(knock.apiKey).toBe("pk_test_12345");
  });

  test("it throws an error if given a secret key", () => {
    expect(() => new Knock("sk_test_12345")).toThrowError(
      "[Knock] You are using your secret API key on the client. Please use the public key.",
    );
  });
});

function generateMockToken(userId: string, expiresInSeconds?: number) {
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  const currentTime = Math.floor(Date.now() / 1000);
  const expireInSeconds = expiresInSeconds ?? 60 * 60;

  return jwt.sign(
    {
      sub: userId,
      iat: currentTime,
      exp: currentTime + expireInSeconds,
    },
    privateKey,
    {
      algorithm: "RS256",
    },
  );
}

describe("it handles authentication correctly", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test("it can schedule a token expiration callback", () => {
    const now = new Date();
    vi.setSystemTime(now);

    const userId = "user1";
    const knock = new Knock("pk_test_12345");
    const mockToken = generateMockToken(userId, 2);

    const onUserTokenExpiring = vi.fn(async (_prevToken, _decodedToken) => {
      const newToken = generateMockToken(userId, 3);
      return newToken;
    });

    knock.authenticate(userId, mockToken, {
      onUserTokenExpiring,
      timeBeforeExpirationInMs: 500,
    });

    // Wait for token to expire
    vi.advanceTimersToNextTimer();
    expect(onUserTokenExpiring).toHaveBeenCalledTimes(1);
  });

  test("it can handle an async callback", () => {
    const now = new Date();
    vi.setSystemTime(now);

    const userId = "user1";
    const knock = new Knock("pk_test_12345");
    const mockToken = generateMockToken(userId, 2);

    const onUserTokenExpiring = vi.fn(async (_prevToken, _decodedToken) => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      return generateMockToken(userId, 5);
    });

    knock.authenticate(userId, mockToken, {
      onUserTokenExpiring,
      timeBeforeExpirationInMs: 500,
    });

    // Wait for token to expire
    vi.advanceTimersToNextTimer();
    expect(onUserTokenExpiring).toHaveBeenCalledTimes(1);
  });
});

describe("client method", () => {
  test("warns when not authenticated", () => {
    const knock = new Knock("pk_test_12345");
    const consoleSpy = vi.spyOn(console, "warn");
    knock.client();
    expect(consoleSpy).toHaveBeenCalledWith(
      "[Knock] You must call authenticate(userId, userToken) first before trying to make a request.\n" +
      "        Typically you'll see this message when you're creating a feed instance before having called\n" +
      "        authenticate with a user Id and token. That means we won't know who to issue the request\n" +
      "        to Knock on behalf of.\n" +
      "        "
    );
  });

  test("returns client instance when authenticated", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("user123", "test-token");
    const client = knock.client();
    expect(client).toBeDefined();
    expect(client).toHaveProperty("apiKey", "pk_test_12345");
    expect(client).toHaveProperty("userToken", "test-token");
  });
});

describe("isAuthenticated method", () => {
  test("returns true when userId exists", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("user123");
    expect(knock.isAuthenticated()).toBe(true);
  });

  test("returns false when no userId exists", () => {
    const knock = new Knock("pk_test_12345");
    expect(knock.isAuthenticated()).toBe(false);
  });

  test("checks userToken when checkUserToken is true", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("user123");
    expect(knock.isAuthenticated(true)).toBe(false);
  });

  test("returns true when both userId and valid token exist", () => {
    const knock = new Knock("pk_test_12345");
    const token = generateMockToken("user123", 60);
    knock.authenticate("user123", token);
    expect(knock.isAuthenticated(true)).toBe(true);
  });
});

describe("teardown method", () => {
  const MOCK_NOW = 1000000;
  const TOKEN_EXPIRY = MOCK_NOW / 1000 + 3600;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Date, 'now').mockImplementation(() => MOCK_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  test("clears token expiration timer", async () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const knock = new Knock("pk_test_12345");
    const token = generateMockToken("user123", TOKEN_EXPIRY);
    const onUserTokenExpiring = vi.fn();

    knock.authenticate("user123", token, {
      onUserTokenExpiring,
      timeBeforeExpirationInMs: 1000,
    });

    vi.advanceTimersByTime(1);
    knock.teardown();
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });

  test("disconnects socket if connected", () => {
    const knock = new Knock("pk_test_12345");
    const disconnectSpy = vi.fn();
    const isConnectedSpy = vi.fn().mockReturnValue(true);

    vi.spyOn(knock, 'client').mockReturnValue({
      socket: {
        disconnect: disconnectSpy,
        isConnected: isConnectedSpy
      }
    } as any);

    knock.authenticate("user123");
    knock.teardown();

    expect(isConnectedSpy).toHaveBeenCalled();
    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("maintains authentication state", () => {
    const knock = new Knock("pk_test_12345");
    const token = generateMockToken("user123", TOKEN_EXPIRY);
    knock.authenticate("user123", token);

    expect(knock.isAuthenticated()).toBe(true);
    knock.teardown();
    expect(knock.isAuthenticated()).toBe(true);
  });
});
