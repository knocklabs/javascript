import { appendQueryString, getQueryString } from "./helpers";

/**
 * The signature that Phoenix expects socket transports to conform to, based on the native browser
 * `WebSocket`. Only fields and methods that Phoenix relies on are included here.
 */
export interface WebSocketLike {
  readonly readyState: number;
  readonly bufferedAmount: number;
  binaryType: BinaryType;
  onopen: ((event: Event) => void) | null;
  onclose: ((event: CloseEvent) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  send(data: string | ArrayBufferLike | ArrayBufferView | Blob): void;
  close(code?: number, reason?: string): void;
}

export type TransportConstructor = new (url: string, protocols?: string | string[]) => WebSocketLike;

export type GatewayConnectResult = {
  signedUrl: string;
  expiresAt: number;
};

export type GatewayTransportOptions = {
  /**
   * Resolves the signed WebSocket URL to connect to. Rejects on failure.
   */
  fetchConnectUrl: (signal: AbortSignal) => Promise<GatewayConnectResult>;
  /**
   * Called when a connection made with the fetched URL closed before it ever
   * opened, which most likely means the URL was rejected (though a network blip
   * could look the same).
   */
  onConnectUrlInvalid?: () => void;
};

/**
 * All possible socket states. Copied from Phoenix, based on the `readyState` property of
 * `WebSocket`.
 * @see {@link https://github.com/phoenixframework/phoenix/blob/1bae3a639f84cd97ccb6b984a8ef4fcdc7aa48ae/assets/js/phoenix/constants.js#L5}
 */
export const SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 } as const;

// WebSocket close event status codes.
// See https://www.rfc-editor.org/info/rfc6455/#section-7.4.1
const CLOSE_CODE_NORMAL = 1000;
const CLOSE_CODE_ABNORMAL = 1006;

export function createGatewayTransport(
  baseTransport: TransportConstructor,
  { fetchConnectUrl, onConnectUrlInvalid }: GatewayTransportOptions,
): TransportConstructor {
  // Use a named class, since Phoenix logs using the class name
  return class GatewayTransport implements WebSocketLike {
    binaryType: BinaryType = "blob";

    onopen: ((event: Event) => void) | null = null;
    onclose: ((event: CloseEvent) => void) | null = null;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onerror: ((event: unknown) => void) | null = null;

    private inner: WebSocketLike | null = null;
    private state: number = SOCKET_STATES.connecting;
    private readonly abort = new AbortController();
    private readonly unsignedQueryString: string;
    private opened = false;
    private closeRequested = false;
    private settled = false;

    constructor(
      url: string,
      private readonly protocols?: string | string[],
    ) {
      // The base URL passed in by Phoenix contains some query params we want to preserve, including
      // vsn (protocol version to send on connect), api_key, user_token, and branch_slug. This query
      // string is considered "unsigned" because it lacks an auth_token query param.
      this.unsignedQueryString = getQueryString(url);

      // Wait for the caller to finish setting up callbacks and properties. This pattern was copied
      // from Phoenix's LongPoll transport.
      setTimeout(() => this.start(), 0);
    }

    get readyState(): number {
      return this.inner ? this.inner.readyState : this.state;
    }

    get bufferedAmount(): number {
      return this.inner ? this.inner.bufferedAmount : 0;
    }

    send(data: string | ArrayBufferLike | ArrayBufferView | Blob): void {
      if (!this.inner) {
        // Phoenix only sends when a connection is open, so prevent calls to send before a
        // connection is established.
        throw new Error("GatewayTransport: cannot send before the connection is open");
      }
      this.inner.send(data);
    }

    close(code?: number, reason?: string): void {
      if (this.closeRequested || this.settled) {
        return;
      }

      this.closeRequested = true;

      if (this.inner) {
        this.inner.close(code, reason);
        return;
      }

      // The socket is closing before the fetch completed. This is still considered a clean close.
      this.abort.abort();
      this.state = SOCKET_STATES.closed;
      this.emitClose(CLOSE_CODE_NORMAL, "", true);
    }

    private async start(): Promise<void> {
      // Phoenix may connect() and disconnect() in the same tick; teardown then calls close() on us
      // before this runs. This prevents a fetch that would be discarded.
      if (this.closeRequested) {
        return;
      }

      let result: GatewayConnectResult;
      try {
        result = await fetchConnectUrl(this.abort.signal);
      } catch (error) {
        if (this.closeRequested) {
          // Ignore this error; the socket was already closed cleanly.
          return;
        }
        // An unexepected error occurred while fetching
        this.fail(error);
        return;
      }

      // The socket was closed while a fetch was in-progress
      if (this.closeRequested) {
        return;
      }

      const connectUrl = appendQueryString(result.signedUrl, this.unsignedQueryString)

      try {
        this.inner = this.initBaseTransport(connectUrl);
      } catch (error) {
        this.fail(error);
      }
    }

    private initBaseTransport(url: string): WebSocketLike {
      const inner = new baseTransport(url, this.protocols);

      inner.binaryType = this.binaryType;
      inner.onopen = (ev) => {
        this.opened = true;
        this.onopen?.(ev);
      };
      inner.onmessage = (ev) => this.onmessage?.(ev);
      inner.onerror = (ev) => this.onerror?.(ev);
      inner.onclose = (ev) => {
        if (!this.opened && !this.closeRequested) {
          // A connection was never opened and this close event was unexpected.
          // The signed connect URL is likely invalid.
          onConnectUrlInvalid?.();
        }
        this.settled = true;
        this.onclose?.(ev);
      };

      return inner;
    }

    private fail(error: unknown): void {
      this.state = SOCKET_STATES.closed;
      this.onerror?.(error);
      this.emitClose(CLOSE_CODE_ABNORMAL, "gateway_connect_failed", false);
    }

    private emitClose(code: number, reason: string, wasClean: boolean): void {
      if (this.settled) {
        return;
      }

      this.settled = true;

      // Mirrors Phoenix's LongPoll.close: CloseEvent exists in browsers.
      // Fall back to a plain object elsewhere (e.g. React Native).
      const opts = { code, reason, wasClean };
      if (typeof CloseEvent !== "undefined") {
        this.onclose?.(new CloseEvent("close", opts));
      } else {
        this.onclose?.(opts as CloseEvent);
      }
    }
  };
}
