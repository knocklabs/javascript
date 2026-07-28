import Knock, { KnockAuthState } from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

/**
 * Subscribes to a Knock client's authentication state, re-rendering when it
 * changes — i.e. on login, logout, or a user switch. Backed by the subscribable
 * `knock.authStore`, so it stays correct even when the client is
 * re-authenticated in place or replaced (e.g. via the `enabled` prop on
 * `KnockProvider`).
 *
 * @example
 * ```ts
 * const { status, userId } = useKnockAuthState(knock);
 * const isAuthenticated = status === "authenticated";
 * ```
 */
export function useKnockAuthState(knock: Knock): KnockAuthState {
  return useStore(knock.authStore, (state) => state);
}

export default useKnockAuthState;
