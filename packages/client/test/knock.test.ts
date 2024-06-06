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
