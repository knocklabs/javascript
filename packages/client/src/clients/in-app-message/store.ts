import { Store } from "@tanstack/store";

import { NetworkStatus } from "../../networkStatus";

import { InAppStoreState } from "./types";

export type InAppStore = Store<
  InAppStoreState,
  (cb: InAppStoreState) => InAppStoreState
>;

export function createStore() {
  return new Store<InAppStoreState>({
    networkStatus: NetworkStatus.ready,
    loading: false,
    messages: {},
    queries: {},
  });
}
