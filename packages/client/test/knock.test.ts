import { describe, expect, test } from "vitest";
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
