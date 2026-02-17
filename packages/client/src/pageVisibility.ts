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
  private wasConnected = false;

  constructor(
    private socket: Socket,
    private disconnectDelayMs: number = DEFAULT_DISCONNECT_DELAY_MS,
  ) {
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.onVisibilityChange);
    }
  }

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

      if (this.socket.isConnected()) {
        this.wasConnected = true;
        this.socket.disconnect();
      }
    }, this.disconnectDelayMs);
  }

  private reconnect() {
    this.clearTimer();

    if (this.wasConnected) {
      this.wasConnected = false;
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
