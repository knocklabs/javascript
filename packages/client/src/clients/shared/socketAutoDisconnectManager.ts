export interface SocketAutoDisconnectOptions {
  /** Enable auto-disconnect when tab becomes inactive */
  enabled: boolean;
  /** Delay in milliseconds before disconnecting (defaults to 2000) */
  delay?: number;
}

export interface SocketAutoDisconnectParams {
  onDisconnect: () => void;
  onConnect: () => void;
  isConnected: () => boolean;
  log: (message: string) => void;
  options: SocketAutoDisconnectOptions;
}

const DEFAULT_DISCONNECT_DELAY = 2000;

/**
 * Manages automatic socket disconnection based on tab visibility.
 *
 * When a tab becomes hidden, the socket will be disconnected after a configurable delay.
 * When the tab becomes visible again, the socket will be reconnected if needed.
 *
 * This helps reduce resource usage for inactive tabs while maintaining good UX
 * by avoiding unnecessary disconnects during brief tab switches.
 */
export class SocketAutoDisconnectManager {
  private options: SocketAutoDisconnectOptions;
  private onDisconnect: () => void;
  private onConnect: () => void;
  private isConnected: () => boolean;
  private log: (message: string) => void;

  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private visibilityChangeHandler: () => void = () => {};

  private isListenerConnected = false;

  constructor(private params: SocketAutoDisconnectParams) {
    this.options = params.options;
    this.onDisconnect = params.onDisconnect;
    this.onConnect = params.onConnect;
    this.isConnected = params.isConnected;
    this.log = params.log;

    this.log(
      `[SocketAutoDisconnectManager] Initialized with options: ${JSON.stringify(this.options)}`,
    );
    this.visibilityChangeHandler = this.handleVisibilityChange.bind(this);
  }

  /**
   * Start listening for visibility changes and managing socket connections
   */
  start(): void {
    this.log("[SocketAutoDisconnectManager] Starting");
    if (!this.options.enabled || this.isListenerConnected) {
      this.log(
        "[SocketAutoDisconnectManager] Not enabled or listener already connected, skipping",
      );
      return;
    }

    if (typeof document === "undefined") {
      this.log("[SocketAutoDisconnectManager] Document is undefined, skipping");
      return;
    }

    this.isListenerConnected = true;
    document.addEventListener("visibilitychange", this.visibilityChangeHandler);
  }

  /**
   * Stop listening for visibility changes and clean up
   */
  stop(): void {
    if (typeof document === "undefined") return;

    document.removeEventListener(
      "visibilitychange",
      this.visibilityChangeHandler,
    );
    this.isListenerConnected = false;

    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
  }

  /**
   * Update the configuration options
   */
  updateOptions(options: SocketAutoDisconnectOptions): void {
    const wasEnabled = this.options.enabled;
    this.options = options;

    if (!wasEnabled && options.enabled) {
      this.start();
    } else if (wasEnabled && !options.enabled) {
      this.stop();
    }
  }

  private handleVisibilityChange(): void {
    const delay = this.options.delay ?? DEFAULT_DISCONNECT_DELAY;

    // TODO: Clean up logs
    if (document.visibilityState === "hidden") {
      this.log(
        `[SocketAutoDisconnectManager] Tab hidden, scheduling disconnect in ${delay}ms`,
      );

      // When the tab is hidden, disconnect the socket after a delay
      this.disconnectTimer = setTimeout(() => {
        this.log(
          "[SocketAutoDisconnectManager] Disconnecting socket due to inactive tab",
        );
        this.onDisconnect();
        this.disconnectTimer = null;
      }, delay);
    } else if (document.visibilityState === "visible") {
      this.log("[SocketAutoDisconnectManager] Tab visible");

      // When the tab becomes visible, clear the disconnect timer if active
      // This handles cases where the tab is only briefly hidden
      if (this.disconnectTimer) {
        this.log(
          "[SocketAutoDisconnectManager] Cancelling scheduled disconnect",
        );
        clearTimeout(this.disconnectTimer);
        this.disconnectTimer = null;
      }

      // If the socket is not connected, try to reconnect
      if (!this.isConnected()) {
        this.log("[SocketAutoDisconnectManager] Reconnecting socket");
        this.onConnect();
      }
    }
  }
}
