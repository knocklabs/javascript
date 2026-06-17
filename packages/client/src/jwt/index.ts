/**
 * Decodes a JWT payload by base64url-decoding the second segment and parsing
 * it as JSON. This does not verify the token signature.
 */

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export class InvalidTokenError extends Error {}
InvalidTokenError.prototype.name = "InvalidTokenError";

function b64DecodeUnicode(str: string): string {
  return decodeURIComponent(
    atob(str).replace(/(.)/g, (char) => {
      let code = char.charCodeAt(0).toString(16).toUpperCase();
      if (code.length < 2) {
        code = "0" + code;
      }
      return "%" + code;
    }),
  );
}

function base64UrlDecode(str: string): string {
  let output = str.replace(/-/g, "+").replace(/_/g, "/");
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += "==";
      break;
    case 3:
      output += "=";
      break;
    default:
      throw new Error("base64 string is not of the correct length");
  }

  try {
    return b64DecodeUnicode(output);
  } catch {
    return atob(output);
  }
}

export function jwtDecode<T = JwtPayload>(token: string): T {
  if (typeof token !== "string") {
    throw new InvalidTokenError("Invalid token specified: must be a string");
  }

  // The payload is the second segment of the JWT (header.payload.signature).
  const part = token.split(".")[1];

  if (typeof part !== "string") {
    throw new InvalidTokenError("Invalid token specified: missing part #2");
  }

  let decoded: string;
  try {
    decoded = base64UrlDecode(part);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new InvalidTokenError(
      `Invalid token specified: invalid base64 for part #2 (${message})`,
    );
  }

  try {
    return JSON.parse(decoded) as T;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    throw new InvalidTokenError(
      `Invalid token specified: invalid json for part #2 (${message})`,
    );
  }
}
