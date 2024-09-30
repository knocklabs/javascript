import { Store } from "@tanstack/store";

import { InAppMessageStoreState } from "./types";

export type InAppStore = Store<
  InAppMessageStoreState,
  (cb: InAppMessageStoreState) => InAppMessageStoreState
>;

export function createStore() {
  return new Store<InAppMessageStoreState>({
    messages: {},
    queries: {},
  });
}
