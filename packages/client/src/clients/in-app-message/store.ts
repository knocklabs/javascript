import { Store } from "@tanstack/store";

import { InAppStoreState } from "./types";

export type InAppStore = Store<
  InAppStoreState,
  (cb: InAppStoreState) => InAppStoreState
>;

export function createStore() {
  return new Store<InAppStoreState>({
    messages: {},
    queries: {},
  });
}
