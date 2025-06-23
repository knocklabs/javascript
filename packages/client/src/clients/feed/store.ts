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

const initialStoreState: FeedStoreState = {
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

export default function createStore() {
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

        console.log("HERE SHOULD SET PAGE", options);

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
      store.setState(() => ({ ...initialStoreState, metadata })),

    setItemAttrs: (itemIds: Array<string>, attrs: Record<string, unknown>) => {
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
}
