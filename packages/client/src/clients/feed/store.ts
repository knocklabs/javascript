import { GenericData } from "@knocklabs/types";
import { createStore as createVanillaZustandStore } from "zustand";

import { NetworkStatus } from "../../networkStatus";

import { FeedItem } from "./interfaces";
import { FeedStoreState } from "./types";
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

const initialStoreState = {
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
};

export default function createStore() {
  return createVanillaZustandStore<FeedStoreState>()((set) => ({
    // Keeps track of all of the items loaded
    ...initialStoreState,
    // The network status indicates what's happening with the request
    networkStatus: NetworkStatus.ready,
    loading: false,

    setNetworkStatus: (networkStatus: NetworkStatus) =>
      set(() => ({
        networkStatus,
        loading: networkStatus === NetworkStatus.loading,
      })),

    setResult: (
      { entries, meta, page_info },
      options = defaultSetResultOptions,
    ) =>
      set((state) => {
        // We resort the list on set, so concating everything is fine (if a bit suboptimal)
        const items = options.shouldAppend
          ? processItems(state.items.concat(entries as FeedItem<GenericData>[]))
          : entries;

        return {
          items,
          metadata: meta,
          pageInfo: options.shouldSetPage ? page_info : state.pageInfo,
          loading: false,
          networkStatus: NetworkStatus.ready,
        };
      }),

    setMetadata: (metadata) => set(() => ({ metadata })),

    resetStore: (metadata = initialStoreState.metadata) =>
      set(() => ({ ...initialStoreState, metadata })),

    setItemAttrs: (itemIds, attrs) => {
      // Create a map for the items to the updates to be made
      const itemUpdatesMap: { [id: string]: object } = itemIds.reduce(
        (acc, itemId) => ({ ...acc, [itemId]: attrs }),
        {},
      );

      return set((state) => {
        const items = state.items.map((item) => {
          if (itemUpdatesMap[item.id]) {
            return { ...item, ...itemUpdatesMap[item.id] };
          }

          return item;
        });

        return { items };
      });
    },
  }));
}
