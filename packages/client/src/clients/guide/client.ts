import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";

import Knock from "../../knock";

import * as ksuid from "./ksuid";

//
// Guides API (via User client)
//

type StepMessageState = {
  id: string | null;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
};

export type KnockGuideStep<M = StepMessageState> = {
  ref: string;
  schema_key: string;
  schema_semver: string;
  schema_variant_key: string;
  message: M;
  // eslint-disable-next-line
  content: any;
};

export type KnockGuide = {
  __typename: "Guide";
  channel_id: string;
  id: string;
  key: string;
  priority: number;
  type: string;
  semver: string;
  steps: KnockGuideStep[];
  inserted_at: string;
  updated_at: string;
};

export const guidesApiRootPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

type GetGuidesQueryParams = {
  data?: string;
  tenant?: string;
  type?: string;
};

type GetGuidesResponse = {
  entries: KnockGuide[];
};

export type GuideEngagementEventBaseParams = {
  // Base params required for all engagement update events
  message_id: string;
  channel_id: string;
  guide_key: string;
  guide_id: string;
  guide_step_ref: string;
};

type MarkAsSeenParams = GuideEngagementEventBaseParams & {
  // Rendered step content seen by the recipient
  content: GenericData;
  // Target params
  data?: GenericData;
  tenant?: string;
};
type MarkAsInteractedParams = GuideEngagementEventBaseParams;
type MarkAsArchivedParams = GuideEngagementEventBaseParams;

type MarkGuideAsResponse = {
  status: "ok";
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

type QueryFilterParams = Pick<GetGuidesQueryParams, "type">;

type EngagedStepMessageState = Omit<StepMessageState, "id"> & {
  id: string;
};

export type SelectFilterParams = {
  key?: string;
  type?: string;
};

export type TargetParams = {
  data?: GenericData | undefined;
  tenant?: string | undefined;
};

export class KnockGuideClient {
  public store: Store<StoreState, (state: StoreState) => StoreState>;

  constructor(
    readonly knock: Knock,
    readonly targetParams: TargetParams = {},
  ) {
    this.knock = knock;

    this.targetParams = {
      data: targetParams.data,
      tenant: targetParams.tenant,
    };

    this.store = new Store<StoreState>({
      guides: [],
      queries: {},
    });

    // TODO(KNO-7788): Set up and attach a socket manager.

    this.knock.log("[Guide] Initialized a guide client");
  }

  async load() {
    this.knock.log("[Guide] Loading all eligible guides");

    // TODO(KNO-7788): Subscribe to a guide channel for real time updates.
    // Pull down all eligible guides in order of priority and recency.
    return this.fetch();
  }

  select(state: StoreState, filters: SelectFilterParams = {}) {
    // TODO(KNO-7790): Need to evaluate activation rules also.

    return state.guides.filter((guide) => {
      if (filters.type && filters.type !== guide.type) {
        return false;
      }

      if (filters.key && filters.key !== guide.key) {
        return false;
      }

      return true;
    });
  }

  async markAsSeen(guide: KnockGuide, step: KnockGuideStep) {
    this.knock.log(
      `[Guide] Marking as seen (guide key: ${guide.key}, step ref:${step.ref})`,
    );

    const updatedStep = this.setStepMessageAttrs(guide.key, step.ref, {
      seen_at: new Date().toISOString(),
    })!;

    const params = {
      ...this.buildEngagementEventBaseParams(guide, updatedStep),
      content: updatedStep.content,
      data: this.targetParams.data,
      tenant: this.targetParams.tenant,
    };

    return this.knock.user.markGuideStepAs<
      MarkAsSeenParams,
      MarkGuideAsResponse
    >("seen", params);
  }

  async markAsInteracted(guide: KnockGuide, step: KnockGuideStep) {
    this.knock.log(
      `[Guide] Marking as interacted (guide key: ${guide.key}, step ref:${step.ref})`,
    );

    const ts = new Date().toISOString();
    const updatedStep = this.setStepMessageAttrs(guide.key, step.ref, {
      read_at: ts,
      interacted_at: ts,
    })!;

    const params = this.buildEngagementEventBaseParams(guide, updatedStep);

    return this.knock.user.markGuideStepAs<
      MarkAsInteractedParams,
      MarkGuideAsResponse
    >("interacted", params);
  }

  async markAsArchived(guide: KnockGuide, step: KnockGuideStep) {
    this.knock.log(
      `[Guide] Marking as archived (guide key: ${guide.key}, step ref:${step.ref})`,
    );

    const updatedStep = this.setStepMessageAttrs(guide.key, step.ref, {
      archived_at: new Date().toISOString(),
    })!;

    const params = this.buildEngagementEventBaseParams(guide, updatedStep);

    return this.knock.user.markGuideStepAs<
      MarkAsArchivedParams,
      MarkGuideAsResponse
    >("archived", params);
  }

  //
  // Private
  //

  private async fetch(opts?: { filters?: QueryFilterParams }) {
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
      const data = await this.knock.user.getGuides<
        GetGuidesQueryParams,
        GetGuidesResponse
      >(queryParams);
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
    // Combine the target params with the given filter params.
    const combinedParams = { ...this.targetParams, ...filterParams };

    // Prune out any keys that have an undefined or null value.
    let params = Object.fromEntries(
      Object.entries(combinedParams).filter(
        ([_k, v]) => v !== undefined && v !== null,
      ),
    );

    // Encode target data as a JSON string, if provided.
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

    const basePath = guidesApiRootPath(this.knock.userId);
    return queryStr ? `${basePath}?${queryStr}` : basePath;
  }

  private setStepMessageAttrs(
    guideKey: string,
    stepRef: string,
    attrs: Partial<StepMessageState>,
  ) {
    //let updatedStep: KnockGuideStep<SetStepMessageAttrs>;
    let updatedStep: KnockGuideStep<EngagedStepMessageState> | undefined;

    this.store.setState((state) => {
      const guides = state.guides.map((guide) => {
        if (guide.key !== guideKey) return guide;

        const steps = guide.steps.map((step) => {
          if (step.ref !== stepRef) return step;

          updatedStep = {
            ...step,
            message: {
              ...step.message,
              // Generate a message id to use for an engagement event call if
              // no message exists yet for the given guide and the step, as a
              // message is generated lazily at the first engagement event.
              id: step.message.id || ksuid.generate(),
              ...attrs,
            },
          } as KnockGuideStep<EngagedStepMessageState>;

          return updatedStep;
        });
        return { ...guide, steps };
      });
      return { ...state, guides };
    });

    return updatedStep;
  }

  private buildEngagementEventBaseParams(
    guide: KnockGuide,
    step: KnockGuideStep<EngagedStepMessageState>,
  ) {
    return {
      message_id: step.message.id,
      channel_id: guide.channel_id,
      guide_key: guide.key,
      guide_id: guide.id,
      guide_step_ref: step.ref,
    };
  }
}
