import { describe, expect, test } from "vitest";

import { InvalidTokenError, jwtDecode } from "../src/jwt";

// Builds a JWT-shaped string for the given payload. Only the payload segment
// is meaningful to `jwtDecode`; the header and signature are placeholders.
const encodeToken = (payload: Record<string, unknown>): string => {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.signature`;
};

describe("jwtDecode", () => {
  test("decodes standard registered claims", () => {
    const token = encodeToken({
      sub: "user_123",
      exp: 9999999999,
      iat: 1516239022,
    });

    const decoded = jwtDecode(token);

    expect(decoded.sub).toBe("user_123");
    expect(decoded.exp).toBe(9999999999);
    expect(decoded.iat).toBe(1516239022);
  });

  test("decodes custom claims via a type parameter", () => {
    const token = encodeToken({ sub: "user_123", role: "admin" });

    const decoded = jwtDecode<{ sub: string; role: string }>(token);

    expect(decoded).toEqual({ sub: "user_123", role: "admin" });
  });

  test("decodes payloads containing unicode characters", () => {
    const token = encodeToken({ name: "José Ünïcode 🚀" });

    const decoded = jwtDecode<{ name: string }>(token);

    expect(decoded.name).toBe("José Ünïcode 🚀");
  });

  // Vary payload length to exercise each `length % 4` padding branch.
  test.each(["a", "ab", "abc", "abcd"])(
    "decodes a base64url payload of length %s (padding)",
    (id) => {
      const decoded = jwtDecode<{ id: string }>(encodeToken({ id }));
      expect(decoded.id).toBe(id);
    },
  );

  test("throws InvalidTokenError when the token is not a string", () => {
    // @ts-expect-error - exercising the runtime guard against non-string input
    expect(() => jwtDecode(undefined)).toThrow(InvalidTokenError);
  });

  test("throws InvalidTokenError when the payload segment is missing", () => {
    expect(() => jwtDecode("only-one-segment")).toThrow(InvalidTokenError);
  });

  test("throws InvalidTokenError when the payload is not valid JSON", () => {
    const notJson = Buffer.from("not json").toString("base64url");

    expect(() => jwtDecode(`header.${notJson}.signature`)).toThrow(
      InvalidTokenError,
    );
  });
});
