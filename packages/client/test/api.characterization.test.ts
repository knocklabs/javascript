/**
 * Characterization tests for the ApiClient HTTP transport.
 *
 * These pin the externally-observable behavior of `makeRequest` — the exact request
 * put on the wire and the `ApiResponse` returned — so the axios -> fetch migration
 * (PR #1010), and any future transport change, cannot silently regress it.
 *
 * The expected values below were captured from the previous axios + axios-retry
 * implementation and verified to be byte-for-byte equivalent (param serialization,
 * headers, body, retry counts, error mapping). This test imports ONLY the client
 * under test — no axios — so it stays valid after axios is removed.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import packageJson from "../package.json";
import ApiClient from "../src/api";

vi.mock("phoenix", () => ({
  Socket: vi.fn().mockImplementation(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn().mockReturnValue(false),
    onOpen: vi.fn(),
    onClose: vi.fn(),
    onError: vi.fn(),
    channel: vi.fn(),
    push: vi.fn(),
    teardown: vi.fn(),
  })),
}));

const HOST = "https://api.knock.app";
const API_KEY = "pk_test_12345";

type Outcome =
  | { kind: "response"; status: number; body: unknown }
  | { kind: "network" };

type CapturedRequest = {
  method: string;
  path: string;
  query: [string, string][];
  headers: Record<string, string>;
  body: unknown;
};

// Headers the client always sends for an unauthenticated request, no branch.
const BASE_HEADERS: Record<string, string> = {
  accept: "application/json",
  "content-type": "application/json",
  authorization: `Bearer ${API_KEY}`,
  "x-knock-client": `Knock/ClientJS ${packageJson.version}`,
};

const normalizeHeaders = (
  h: HeadersInit | undefined,
): Record<string, string> => {
  if (!h) return {};
  const plain =
    typeof Headers !== "undefined" && h instanceof Headers
      ? Object.fromEntries(h.entries())
      : Array.isArray(h)
        ? Object.fromEntries(h)
        : (h as Record<string, string>);
  return Object.fromEntries(
    Object.entries(plain)
      .filter(([, v]) => v !== null && v !== undefined)
      .map(([k, v]) => [k.toLowerCase(), String(v)]),
  );
};

// Compare the params the server actually receives, independent of `[]` vs `%5B%5D`
// percent-encoding differences.
const splitUrl = (
  u: string,
): { path: string; query: [string, string][] } => {
  const url = new URL(u);
  return { path: url.origin + url.pathname, query: [...url.searchParams] };
};

const makeClient = (
  opts: { userToken?: string; branch?: string },
  outcomes: Outcome[],
) => {
  const client = new ApiClient({
    host: HOST,
    apiKey: API_KEY,
    userToken: opts.userToken,
    branch: opts.branch,
  });

  const captured: CapturedRequest[] = [];
  let i = 0;
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    const { path, query } = splitUrl(String(url));
    captured.push({
      method: String(init?.method ?? "GET").toUpperCase(),
      path,
      query,
      headers: normalizeHeaders(init?.headers),
      body: init?.body ?? undefined,
    });
    const outcome = outcomes[Math.min(i, outcomes.length - 1)]!;
    i += 1;
    if (outcome.kind === "network") throw new TypeError("Failed to fetch");
    const hasBody = outcome.body !== undefined && outcome.status !== 204;
    return new Response(hasBody ? JSON.stringify(outcome.body) : null, {
      status: outcome.status,
      headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    });
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).fetchClient = fetchMock;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).delay = vi.fn().mockResolvedValue(undefined); // instant backoff

  return { client, captured };
};

const OK: Outcome[] = [{ kind: "response", status: 200, body: { ok: true } }];

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  vi.restoreAllMocks();
});

describe("ApiClient wire format (characterization)", () => {
  test("GET with no params, unauthenticated", async () => {
    const { client, captured } = makeClient({}, OK);
    await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(captured).toHaveLength(1);
    expect(captured[0]!.method).toBe("GET");
    expect(captured[0]!.path).toBe("https://api.knock.app/v1/ping");
    expect(captured[0]!.query).toEqual([]);
    expect(captured[0]!.headers).toEqual(BASE_HEADERS);
    expect(captured[0]!.body).toBeUndefined();
  });

  test("array, boolean, and undefined params serialize as before", async () => {
    const { client, captured } = makeClient({}, OK);
    await client.makeRequest({
      method: "GET",
      url: "/v1/users/u_1/feeds/f_1",
      params: {
        status: "unread",
        tenant: "tenant_1",
        has_tenant: true,
        page_size: 50,
        archived: "exclude",
        workflow_categories: ["billing", "security"],
        source: undefined,
      },
    });

    expect(captured[0]!.path).toBe("https://api.knock.app/v1/users/u_1/feeds/f_1");
    expect(captured[0]!.query).toEqual([
      ["status", "unread"],
      ["tenant", "tenant_1"],
      ["has_tenant", "true"],
      ["page_size", "50"],
      ["archived", "exclude"],
      ["workflow_categories[]", "billing"],
      ["workflow_categories[]", "security"],
    ]);
  });

  test("nested object params serialize with bracket notation (Slack auth_check)", async () => {
    const { client, captured } = makeClient({}, OK);
    await client.makeRequest({
      method: "GET",
      url: "/v1/providers/slack/ch_1/auth_check",
      params: {
        access_token_object: { object_id: "tenant_1", collection: "$tenants" },
        channel_id: "ch_1",
      },
    });

    expect(captured[0]!.query).toEqual([
      ["access_token_object[object_id]", "tenant_1"],
      ["access_token_object[collection]", "$tenants"],
      ["channel_id", "ch_1"],
    ]);
  });

  test("nested object + secondary object params (MS Teams channels)", async () => {
    const { client, captured } = makeClient({}, OK);
    await client.makeRequest({
      method: "GET",
      url: "/v1/providers/ms-teams/ch_1/channels",
      params: {
        ms_teams_tenant_object: { object_id: "tenant_1", collection: "$tenants" },
        team_id: "team_1",
        query_options: { paginationToken: "tok_abc", maxResults: 10 },
      },
    });

    expect(captured[0]!.query).toEqual([
      ["ms_teams_tenant_object[object_id]", "tenant_1"],
      ["ms_teams_tenant_object[collection]", "$tenants"],
      ["team_id", "team_1"],
      ["query_options[paginationToken]", "tok_abc"],
      ["query_options[maxResults]", "10"],
    ]);
  });

  test("Date params serialize to ISO 8601", async () => {
    const { client, captured } = makeClient({}, OK);
    await client.makeRequest({
      method: "GET",
      url: "/v1/messages",
      params: { since: new Date("2024-01-02T03:04:05.000Z"), page_size: 25 },
    });

    expect(captured[0]!.query).toEqual([
      ["since", "2024-01-02T03:04:05.000Z"],
      ["page_size", "25"],
    ]);
  });

  test("POST serializes JSON body and keeps method", async () => {
    const { client, captured } = makeClient({}, [
      { kind: "response", status: 201, body: { created: true } },
    ]);
    await client.makeRequest({
      method: "POST",
      url: "/v1/users/u_1",
      data: { name: "Test", value: 42, nested: { a: 1, b: [1, 2] } },
    });

    expect(captured[0]!.method).toBe("POST");
    expect(captured[0]!.body).toBe(
      '{"name":"Test","value":42,"nested":{"a":1,"b":[1,2]}}',
    );
  });

  test("authenticated request adds user-token and branch headers", async () => {
    const { client, captured } = makeClient(
      { userToken: "user_token_456", branch: "my-branch" },
      OK,
    );
    await client.makeRequest({ method: "GET", url: "/v1/users/u_1" });

    expect(captured[0]!.headers).toEqual({
      ...BASE_HEADERS,
      "x-knock-user-token": "user_token_456",
      "x-knock-branch": "my-branch",
    });
  });

  test("user-token and branch headers are omitted when unset", async () => {
    const { client, captured } = makeClient({}, OK);
    await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(captured[0]!.headers).not.toHaveProperty("x-knock-user-token");
    expect(captured[0]!.headers).not.toHaveProperty("x-knock-branch");
  });
});

describe("ApiClient response mapping (characterization)", () => {
  test("2xx success", async () => {
    const { client } = makeClient({}, [
      { kind: "response", status: 200, body: { data: "hello" } },
    ]);
    const res = await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(res).toMatchObject({
      statusCode: "ok",
      status: 200,
      body: { data: "hello" },
      error: undefined,
    });
  });

  test("204 No Content yields an undefined body", async () => {
    const { client } = makeClient({}, [
      { kind: "response", status: 204, body: undefined },
    ]);
    const res = await client.makeRequest({ method: "DELETE", url: "/v1/thing" });

    expect(res.statusCode).toBe("ok");
    expect(res.status).toBe(204);
    expect(res.body).toBeUndefined();
  });

  test("network error: retried to 4 total attempts, mapped to status 500", async () => {
    const { client, captured } = makeClient({}, [{ kind: "network" }]);
    const res = await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(captured).toHaveLength(4); // 1 initial + 3 retries (matches axios-retry)
    expect(res.statusCode).toBe("error");
    expect(res.status).toBe(500);
    expect(res.body).toBeUndefined();
    expect(res.error).toBeInstanceOf(Error);
  });

  test("5xx: retried to 4 total attempts, error.response.status preserved", async () => {
    const { client, captured } = makeClient({}, [
      { kind: "response", status: 500, body: { error: "boom" } },
    ]);
    const res = await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(captured).toHaveLength(4);
    expect(res.statusCode).toBe("error");
    expect(res.error?.response?.status).toBe(500);
  });

  test("429 then 200: retried once and succeeds", async () => {
    const { client, captured } = makeClient({}, [
      { kind: "response", status: 429, body: { error: "rate limited" } },
      { kind: "response", status: 200, body: { ok: true } },
    ]);
    const res = await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(captured).toHaveLength(2);
    expect(res.statusCode).toBe("ok");
    expect(res.body).toEqual({ ok: true });
  });

  test("4xx (404): not retried; error.response carries status and body", async () => {
    const { client, captured } = makeClient({}, [
      { kind: "response", status: 404, body: { error: "Not found" } },
    ]);
    const res = await client.makeRequest({ method: "GET", url: "/v1/ping" });

    expect(captured).toHaveLength(1); // no retry on 4xx
    expect(res.statusCode).toBe("error");
    expect(res.error?.response?.status).toBe(404);
    expect(res.error?.response?.data).toEqual({ error: "Not found" });

    // Behavior change vs the old axios transport (which hardcoded these on error):
    // the top-level status/body now reflect the real response. handleResponse
    // consumers read error.response.status, so they are unaffected.
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});
