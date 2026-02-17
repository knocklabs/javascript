/**
 * Represents the badge count type for notification badges.
 */
export type BadgeCountType = "unseen" | "unread" | "all";

/**
 * Represents the connection status for OAuth-based integrations (Slack, MS Teams, etc.)
 */
export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error"
  | "disconnecting";

/**
 * Result returned by authentication check API calls
 */
export interface AuthCheckResult {
  connection?: {
    ok?: boolean;
    error?: string;
  };
  code?: string;
  response?: {
    data?: {
      message?: string;
    };
  };
}
