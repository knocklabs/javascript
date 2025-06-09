// @vitest-environment node
import { describe, expect, test } from "vitest";

import Knock, { Feed, FeedClient } from "../src/index";

describe("index exports", () => {
  test("exports Knock as default export", () => {
    expect(Knock).toBeDefined();
    expect(typeof Knock).toBe("function");
  });

  test("exports Feed named export", () => {
    expect(Feed).toBeDefined();
    expect(typeof Feed).toBe("function");
  });

  test("exports FeedClient named export", () => {
    expect(FeedClient).toBeDefined();
    expect(typeof FeedClient).toBe("function");
  });

  test("can create Knock instance from default export", () => {
    const knock = new Knock("pk_test_12345");
    expect(knock).toBeInstanceOf(Knock);
    expect(knock.apiKey).toBe("pk_test_12345");
  });

  test("can create FeedClient instance", () => {
    const knock = new Knock("pk_test_12345");
    const feedClient = new FeedClient(knock);
    expect(feedClient).toBeInstanceOf(FeedClient);
  });
});
