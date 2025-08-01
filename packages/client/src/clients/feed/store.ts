import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";

import { NetworkStatus } from "../../networkStatus";

import { FeedItem, FeedMetadata, FeedResponse } from "./interfaces";
import { FeedStoreState, StoreFeedResultOptions } from "./types";
import { deduplicateItems, sortItems } from "./utils";

function processItems(items: FeedItem[]) {
  const deduped = deduplicateItems(items);
  const sorted = sortItems(deduped);

  return sorted;
}

const defaultSetResultOptions = {
  shouldSetPage: true,
  shouldAppend: false,
};

export const initialStoreState: FeedStoreState = {
  items: [],
  metadata: {
    total_count: 0,
    unread_count: 0,
    unseen_count: 0,
  },
  pageInfo: {
    before: null,
    after: null,
    page_size: 50,
  },
  loading: false,
  networkStatus: NetworkStatus.ready,
  setResult: () => {},
  setMetadata: () => {},
  setNetworkStatus: () => {},
  resetStore: () => {},
  setItemAttrs: () => {},
};

/**
 * Initalize the store with tanstack store so it can be used within our
 * FeedStore class. We do this seperately so that we have the ability to
 * change which store library we use in the future if need be.
 */
const initalizeStore = () => {
  const store = new Store(initialStoreState);

  store.setState((state) => ({
    ...state,
    // The network status indicates what's happening with the request
    networkStatus: NetworkStatus.ready,
    loading: false,
    setNetworkStatus: (networkStatus: NetworkStatus) =>
      store.setState((state) => ({
        ...state,
        networkStatus,
        loading: networkStatus === NetworkStatus.loading,
      })),

    setResult: (
      { entries, meta, page_info }: FeedResponse,
      options: StoreFeedResultOptions = defaultSetResultOptions,
    ) =>
      store.setState((state) => {
        // We resort the list on set, so concating everything is fine (if a bit suboptimal)
        const items = options.shouldAppend
          ? processItems(state.items.concat(entries as FeedItem<GenericData>[]))
          : entries;

        return {
          ...state,
          items,
          metadata: meta,
          pageInfo: options.shouldSetPage ? page_info : state.pageInfo,
          loading: false,
          networkStatus: NetworkStatus.ready,
        };
      }),

    setMetadata: (metadata: FeedMetadata) =>
      store.setState((state) => ({ ...state, metadata })),

    resetStore: (metadata = initialStoreState.metadata) =>
      store.setState(() => ({
        ...initialStoreState,
        setResult: store.state.setResult,
        setMetadata: store.state.setMetadata,
        setNetworkStatus: store.state.setNetworkStatus,
        resetStore: store.state.resetStore,
        setItemAttrs: store.state.setItemAttrs,
        metadata,
      })),

    setItemAttrs: (itemIds: Array<string>, attrs: object) => {
      // Create a map for the items to the updates to be made
      const itemUpdatesMap: { [id: string]: object } = itemIds.reduce(
        (acc, itemId) => ({ ...acc, [itemId]: attrs }),
        {},
      );

      return store.setState((state) => {
        const items = state.items.map((item) => {
          if (itemUpdatesMap[item.id]) {
            return { ...item, ...itemUpdatesMap[item.id] };
          }

          return item;
        });

        return { ...state, items };
      });
    },
  }));

  return store;
};

/**
 * The FeedStore class is a wrapper for our store solution that's
 * based on the same shape as zustand. This wrapping class allows
 * us to maintain backwards compatibility with the zustand model
 * while still allowing us to utilize tanstack store for the
 * underlying store solution.
 */
export class FeedStore {
  store: Store<FeedStoreState>;

  constructor(store: Store<FeedStoreState>) {
    this.store = store;
  }

  getState() {
    return this.store.state;
  }

  setState(
    updater: ((state: FeedStoreState) => FeedStoreState) | FeedStoreState,
  ) {
    this.store.setState(
      typeof updater === "function" ? updater : () => updater,
    );
  }

  getInitialState() {
    return initialStoreState;
  }

  subscribe(listener: (state: FeedStoreState) => void) {
    return this.store.subscribe((state) => listener(state.currentVal));
  }
}

export default function createStore() {
  const store = initalizeStore();
  return new FeedStore(store);
}
