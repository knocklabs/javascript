import {
  MockInstance,
  describe,
  expect,
  test,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import Knock from "../src/knock";

describe("it can create a feed client", () => {
  test("it sets configuration values", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    const feedClient = knock.feeds.initialize("feedId", {});
    expect(feedClient.feedId).toBe("feedId");
  });
});

describe("it can auto manage socket connections", () => {
  let addEventListenerSpy: MockInstance;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(document, "addEventListener");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it is disabled by default", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    knock.feeds.initialize("feedId", {});
    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });

  test("it auto disconnects and reconnects sockets when document visibility changes", () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    knock.feeds.initialize("feedId", {
      auto_manage_socket_connection: true,
    });

    expect(knock.client().socket).toBeDefined();

    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "visibilitychange",
      expect.any(Function),
    );
  });
});
