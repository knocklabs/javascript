/**
 * Decodes a JWT payload by base64url-decoding the second segment and parsing
 * it as JSON. This does not verify the token signature.
 */

export type JwtPayload = {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
};

export class InvalidTokenError extends Error {}
InvalidTokenError.prototype.name = "InvalidTokenError";

const b64DecodeUnicode = (str: string): string => {
  return decodeURIComponent(
    atob(str).replace(/(.)/g, (char) => {
      const code = char.charCodeAt(0).toString(16).toUpperCase();
      return "%" + code.padStart(2, "0");
    }),
  );
};

const base64UrlDecode = (str: string): string => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const remainder = base64.length % 4;
  if (remainder === 1) {
    throw new Error("base64 string is not of the correct length");
  }
  const padded = base64 + "=".repeat((4 - remainder) % 4);

  try {
    return b64DecodeUnicode(padded);
  } catch {
    return atob(padded);
  }
};

const decodePayloadSegment = (part: string): string => {
  try {
    return base64UrlDecode(part);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new InvalidTokenError(
      `Invalid token specified: invalid base64 for part #2 (${message})`,
    );
  }
};

export const jwtDecode = <T = JwtPayload>(token: string): T => {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }

  // The payload is the second segment of the JWT (header.payload.signature).
  const part = token.split(".")[1];

  if (typeof part !== "string") {
    throw new InvalidTokenError("Invalid token specified: missing part #2");
  }

  const decoded = decodePayloadSegment(part);

  try {
    return JSON.parse(decoded) as T;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new InvalidTokenError(
      `Invalid token specified: invalid json for part #2 (${message})`,
    );
  }
};
