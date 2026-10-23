import type { Socket } from "phoenix";

const DEFAULT_DISCONNECT_DELAY_MS = 30_000;

/**
 * Disconnects the socket after a delay when the page becomes hidden,
 * and reconnects when it becomes visible again. This avoids holding
 * open connections for background tabs that aren't being viewed.
 *
 * The delay prevents unnecessary disconnects during brief tab switches.
 * Phoenix channels automatically rejoin after reconnecting.
 */
export class PageVisibilityManager {
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnectOnVisible = false;
  private socketWasActive = false;

  constructor(
    private socket: Socket,
    private disconnectDelayMs: number = DEFAULT_DISCONNECT_DELAY_MS,
  ) {
    // Track whether the socket has ever attempted to connect so we only park
    // (and later resume) sockets the consumer actually activated. Both
    // callbacks fire only after connect() has been called at least once.
    this.socket.onOpen(this.markActive);
    this.socket.onClose(this.markActive);

    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

  private markActive = () => {
    this.socketWasActive = true;
  };

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.scheduleDisconnect();
    } else {
      this.reconnect();
    }
  };

  private scheduleDisconnect() {
    this.clearTimer();

    this.disconnectTimer = setTimeout(() => {
      this.disconnectTimer = null;

      // Disconnect even when the socket is mid-reconnect rather than fully
      // connected: a socket retrying against, say, a rejected credential would
      // otherwise keep looping in a hidden background tab. disconnect() also
      // cancels Phoenix's pending reconnect timer.
      if (this.socketWasActive) {
        this.shouldReconnectOnVisible = true;
        this.socket.disconnect();
      }
    }, this.disconnectDelayMs);
  }

  private reconnect() {
    this.clearTimer();

    if (this.shouldReconnectOnVisible) {
      this.shouldReconnectOnVisible = false;
      this.socket.connect();
    }
  }

  private clearTimer() {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
  }

  teardown() {
    this.clearTimer();

    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.onVisibilityChange);
    }
  }
}
