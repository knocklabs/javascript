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
  onerror: ((event: Event) => void) | null;
  onmessage: ((event: MessageEvent) => void) | null;
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
   * looks the same).
   */
  onConnectUrlInvalid?: () => void;
};

