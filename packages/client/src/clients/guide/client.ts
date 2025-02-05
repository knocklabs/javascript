import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";

import Knock from "../../knock";

//
// Guides API (via User client)
//

type Guide<T = GenericData> = {
  __typename: "Guide";
  id: string;
  key: string;

  message_type: string;
  schema_version: string;
  schema_variant: string;
  content: T;

  // TODO(KNO-7792): Add engagement state timestamps.
  inserted_at: string;
  updated_at: string;
};

export const getGuidesPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

export type GetGuidesQueryParams = {
  data?: string;
  tenant?: string;
  message_type?: string[];
};

export type GetGuidesResponse<T = GenericData> = {
  entries: Guide<T>[];
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
  guides: Guide[];
  queries: Record<QueryKey, QueryStatus>;
};

type QueryFilterParams = {
  message_type?: string | string[];
};

type SelectFilterParams = QueryFilterParams & {
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
    this.triggerParams = this.onlyTriggerParams(triggerParams);

    this.store = new Store<StoreState>({
      guides: [],
      queries: {},
    });

    // TODO(KNO-7788): Set up and attach a socket manager.

    this.knock.log("[Guide] Initialized a guide client");
  }

  selectGuides(state: StoreState, filters: SelectFilterParams = {}) {
    // TODO(KNO-7790): Need to consider activation rules also.
    return state.guides.filter((guide) => {
      const messageTypes =
        filters.message_type && typeof filters.message_type === "string"
          ? [filters.message_type]
          : filters.message_type || [];

      if (
        messageTypes.length > 0 &&
        !messageTypes.includes(guide.message_type)
      ) {
        return false;
      }

      if (filters.key && filters.key !== guide.key) {
        return false;
      }

      return true;
    });
  }

  async fetchGuides<T extends GenericData = GenericData>(opts?: {
    filters?: QueryFilterParams;
  }) {
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
      const data = await this.knock.user.getGuides<T>({ params: queryParams });
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

    // Handle message type(s) as an array for consistent serialization when
    // provided.
    params =
      params.message_type && typeof params.message_type === "string"
        ? { ...params, message_type: [params.message_type] }
        : params;

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

  private onlyTriggerParams(params: GenericData): TriggerParams {
    return {
      data: params.data,
      tenant: params.tenant,
    };
  }
}
