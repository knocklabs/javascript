import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";

import Knock from "../../knock";

//
// Guides API (via User client)
//

export type KnockGuide = {
  __typename: "Guide";
  id: string;
  key: string;
  message_type: string;
  schema_version: string;
  schema_variant: string;
  // eslint-disable-next-line
  content: any;

  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
  inserted_at: string;
  updated_at: string;
};

export const getGuidesPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

export type GetGuidesQueryParams = {
  data?: string;
  tenant?: string;
  message_type?: string;
};

export type GetGuidesResponse = {
  entries: KnockGuide[];
};

//
// Guides client
//

type QueryKey = string;

type QueryStatus = {
  status: "loading" | "ok" | "error";
  error?: Error;
};

type StoreState = {
  guides: KnockGuide[];
  queries: Record<QueryKey, QueryStatus>;
};

type QueryFilterParams = Pick<GetGuidesQueryParams, "message_type">;

export type SelectFilterParams = QueryFilterParams & {
  key?: string;
};

export type TriggerParams = {
  data?: GenericData;
  tenant?: string;
};

export class KnockGuideClient {
  public store: Store<StoreState, (state: StoreState) => StoreState>;

  constructor(
    readonly knock: Knock,
    readonly triggerParams: TriggerParams = {},
  ) {
    this.knock = knock;

    this.triggerParams = {
      data: triggerParams.data,
      tenant: triggerParams.tenant,
    };

    this.store = new Store<StoreState>({
      guides: [],
      queries: {},
    });

    // TODO(KNO-7788): Set up and attach a socket manager.

    this.knock.log("[Guide] Initialized a guide client");
  }

  init() {
    console.log("init()")

    // TODO(KNO-7788): Subscribe to a guide channel for real time updates.
    // Pull down all eligible guides in order of priority and recency.
    return this.fetch();
  }

  select(state: StoreState, filters: SelectFilterParams = {}) {
    // TODO(KNO-7790): Need to consider activation rules also.
    // TODO: Should exclude archived guides by default?

    return state.guides.filter((guide) => {
      if (filters.message_type && filters.message_type !== guide.message_type) {
        return false;
      }

      if (filters.key && filters.key !== guide.key) {
        return false;
      }

      return true;
    });
  }

  async fetch(opts?: { filters?: QueryFilterParams }) {
    const queryParams = this.buildQueryParams(opts?.filters);
    const queryKey = this.formatQueryKey(queryParams);

    // If already fetched before, then noop.
    const maybeQueryStatus = this.store.state.queries[queryKey];
    if (maybeQueryStatus) {
      return maybeQueryStatus;
    }

    // Mark this query status as loading.
    this.store.setState((state) => ({
      ...state,
      queries: { ...state.queries, [queryKey]: { status: "loading" } },
    }));

    let queryStatus: QueryStatus;
    try {
      const data = await this.knock.user.getGuides({ params: queryParams });
      queryStatus = { status: "ok" };

      this.store.setState((state) => ({
        ...state,
        // For now assume a single fetch to get all eligible guides. When/if
        // we implement incremental loads, then this will need to be a merge
        // and sort operation.
        guides: data.entries,
        queries: { ...state.queries, [queryKey]: queryStatus },
      }));
    } catch (e) {
      queryStatus = { status: "error", error: e as Error };

      this.store.setState((state) => ({
        ...state,
        queries: { ...state.queries, [queryKey]: queryStatus },
      }));
    }

    return queryStatus;
  }

  private buildQueryParams(filterParams: QueryFilterParams = {}) {
    // Combine the trigger params with the given filter params.
    const combinedParams = { ...this.triggerParams, ...filterParams };

    // Prune out any keys that have an undefined or null value.
    let params = Object.fromEntries(
      Object.entries(combinedParams).filter(
        ([_k, v]) => v !== undefined && v !== null,
      ),
    );

    // Encode trigger data as a JSON string, if provided.
    params = params.data
      ? { ...params, data: JSON.stringify(params.data) }
      : params;

    return params as GetGuidesQueryParams;
  }

  private formatQueryKey(queryParams: GenericData) {
    const sortedKeys = Object.keys(queryParams).sort();

    const queryStr = sortedKeys
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`,
      )
      .join("&");

    const basePath = getGuidesPath(this.knock.userId);
    return queryStr ? `${basePath}?${queryStr}` : basePath;
  }

  //
  // Engagement status update
  //

  async markAsSeen(_guide: KnockGuide) {
    // TODO:
    return;
  }

  async markAsInteracted(_guide: KnockGuide) {
    // TODO:
    return;
  }

  async markAsArchived(_guide: KnockGuide) {
    // TODO:
    return;
  }
}
