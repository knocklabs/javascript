import { Store } from "@tanstack/store";

import { InAppMessagesStoreState } from "./types";

export type InAppMessagesStore = Store<
  InAppMessagesStoreState,
  (cb: InAppMessagesStoreState) => InAppMessagesStoreState
>;

export function createStore() {
  return new Store<InAppMessagesStoreState>({
    messages: {},
    queries: {},
  });
}
