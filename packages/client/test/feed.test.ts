import {
  MockInstance,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";

import Knock from "../src/knock";
import ApiClient from "../src/api";

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

describe("it can handle date range parameters", () => {
  let makeRequestSpy: MockInstance;

  beforeEach(() => {
    makeRequestSpy = vi.spyOn(ApiClient.prototype, "makeRequest");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("it properly formats date range parameters for API requests", async () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    const feedClient = knock.feeds.initialize("feedId", {
      inserted_at_date_range: {
        start: "2024-01-01T00:00:00Z",
        end: "2024-02-01T00:00:00Z",
        inclusive: true,
      },
    });

    // Trigger a fetch to see the actual request parameters
    await feedClient.fetch();

    expect(makeRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          "inserted_at.gte": "2024-01-01T00:00:00Z",
          "inserted_at.lte": "2024-02-01T00:00:00Z",
        }),
      }),
    );
  });

  test("it handles non-inclusive date ranges", async () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    const feedClient = knock.feeds.initialize("feedId", {
      inserted_at_date_range: {
        start: "2024-01-01T00:00:00Z",
        end: "2024-02-01T00:00:00Z",
        inclusive: false,
      },
    });

    await feedClient.fetch();

    expect(makeRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          "inserted_at.gt": "2024-01-01T00:00:00Z",
          "inserted_at.lt": "2024-02-01T00:00:00Z",
        }),
      }),
    );
  });

  test("it handles partial date ranges", async () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    // Start date only
    const feedClientStart = knock.feeds.initialize("feedId", {
      inserted_at_date_range: {
        start: "2024-01-01T00:00:00Z",
        inclusive: true,
      },
    });
    await feedClientStart.fetch();
    expect(makeRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          "inserted_at.gte": "2024-01-01T00:00:00Z",
        }),
      }),
    );

    // End date only
    const feedClientEnd = knock.feeds.initialize("feedId", {
      inserted_at_date_range: {
        end: "2024-02-01T00:00:00Z",
        inclusive: true,
      },
    });
    await feedClientEnd.fetch();
    expect(makeRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          "inserted_at.lte": "2024-02-01T00:00:00Z",
        }),
      }),
    );
  });

  test("it preserves other options when no date range is provided", async () => {
    const knock = new Knock("pk_test_12345");
    knock.authenticate("userId");

    const feedClient = knock.feeds.initialize("feedId", {
      auto_manage_socket_connection: true,
      archived: "include",
    });

    await feedClient.fetch();

    expect(makeRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.objectContaining({
          archived: "include",
        }),
      }),
    );
  });
});
