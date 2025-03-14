import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";

import Knock from "../../knock";

const sortGuides = (guides: KnockGuide<WithStepHandlers>[]) => {
  return [...guides].sort(
    (a, b) =>
      b.priority - a.priority ||
      new Date(b.inserted_at).getTime() - new Date(a.inserted_at).getTime(),
  );
};

//
// Guides API (via User client)
//

export const guidesApiRootPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

type StepMessageState = {
  id: string;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
};

export type KnockGuideStep<H = unknown> = H & {
  ref: string;
  schema_key: string;
  schema_semver: string;
  schema_variant_key: string;
  message: StepMessageState;
  // eslint-disable-next-line
  content: any;
};

export type KnockGuide<H = unknown> = {
  __typename: "Guide";
  channel_id: string;
  id: string;
  key: string;
  priority: number;
  type: string;
  semver: string;
  steps: KnockGuideStep<H>[];
  inserted_at: string;
  updated_at: string;
};

type WithStepHandlers = {
  markAsSeen: () => void;
  markAsInteracted: (params?: { metadata?: GenericData }) => void;
  markAsArchived: () => void;
};

// TODO: Make these type defs more succinct and streamlined.
export type KnockGuideWithHandlers = KnockGuide<WithStepHandlers>;
export type KnockGuideStepWithHandlers = KnockGuideStep<WithStepHandlers>;

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

type SocketEventType = "guide.added" | "guide.updated" | "guide.removed";

type SocketEventPayload<E extends SocketEventType, D> = {
  topic: string;
  event: E;
  data: D;
};

type GuideAddedEvent = SocketEventPayload<
  "guide.added",
  { guide: KnockGuide; eligible: true }
>;

type GuideUpdatedEvent = SocketEventPayload<
  "guide.updated",
  { guide: KnockGuide; eligible: boolean }
>;

type GuideRemovedEvent = SocketEventPayload<
  "guide.removed",
  { guide: Pick<KnockGuide, "key"> }
>;

type GuideSocketEvent = GuideAddedEvent | GuideUpdatedEvent | GuideRemovedEvent;

//
// Guides client
//

type QueryKey = string;

type QueryStatus = {
  status: "loading" | "ok" | "error";
  error?: Error;
};

type StoreState = {
  guides: KnockGuideWithHandlers[];
  queries: Record<QueryKey, QueryStatus>;
};

type QueryFilterParams = Pick<GetGuidesQueryParams, "type">;

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

  // Phoenix channels for real time guide updates over websocket
  private socket: Socket | undefined;
  private socketChannel: Channel | undefined;
  private socketChannelTopic: string;
  private socketEventTypes = ["guide.added", "guide.updated", "guide.removed"];

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
    readonly targetParams: TargetParams = {},
  ) {
    this.store = new Store<StoreState>({
      guides: [],
      queries: {},
    });

    // In server environments we might not have a socket connection.
    const { socket: maybeSocket } = this.knock.client();
    this.socket = maybeSocket;
    this.socketChannelTopic = `guides:${channelId}`;

    this.knock.log("[Guide] Initialized a guide client");
  }

  async fetch(opts?: { filters?: QueryFilterParams }) {
    this.knock.failIfNotAuthenticated();
    this.knock.log("[Guide] Loading all eligible guides");

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
      >(this.channelId, queryParams);
      queryStatus = { status: "ok" };

      this.store.setState((state) => ({
        ...state,
        // For now assume a single fetch to get all eligible guides. When/if
        // we implement incremental loads, then this will need to be a merge
        // and sort operation.
        guides: data.entries.map((g) => this.localCopy(g)),
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

  subscribe() {
    if (!this.socket) return;
    this.knock.failIfNotAuthenticated();
    this.knock.log("[Guide] Subscribing to real time updates");

    // Ensure a live socket connection if not yet connected.
    if (!this.socket.isConnected()) {
      this.socket.connect();
    }

    // If there's an existing connected channel, then disconnect.
    if (this.socketChannel) {
      this.unsubscribe();
    }

    // Join the channel topic and subscribe to supported events.
    const params = { ...this.targetParams, user_id: this.knock.userId };
    const newChannel = this.socket.channel(this.socketChannelTopic, params);

    for (const eventType of this.socketEventTypes) {
      newChannel.on(eventType, (payload) => this.handleSocketEvent(payload));
    }

    if (["closed", "errored"].includes(newChannel.state)) {
      newChannel.join();
    }

    // Track the joined channel.
    this.socketChannel = newChannel;
  }

  unsubscribe() {
    if (!this.socketChannel) return;
    this.knock.log("[Guide] Unsubscribing from real time updates");

    // Unsubscribe from the socket events and leave the channel.
    for (const eventType of this.socketEventTypes) {
      this.socketChannel.off(eventType);
    }
    this.socketChannel.leave();

    // Unset the channel.
    this.socketChannel = undefined;
  }

  private handleSocketEvent(payload: GuideSocketEvent) {
    const { event, data } = payload;

    switch (event) {
      case "guide.added":
        return this.addGuide(payload);

      case "guide.updated":
        return data.eligible
          ? this.replaceOrAddGuide(payload)
          : this.removeGuide(payload);

      case "guide.removed":
        return this.removeGuide(payload);

      default:
        return;
    }
  }

  //
  // Store selector
  //

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

  //
  // Engagement event handlers
  //
  // Make an optimistic update on the client side first, then send an engagement
  // event to the backend.
  //

  async markAsSeen(guide: KnockGuide, step: KnockGuideStep) {
    this.knock.log(
      `[Guide] Marking as seen (Guide key: ${guide.key}, Step ref:${step.ref})`,
    );

    const updatedStep = this.setStepMessageAttrs(guide.key, step.ref, {
      seen_at: new Date().toISOString(),
    });
    if (!updatedStep) return;

    const params = {
      ...this.buildEngagementEventBaseParams(guide, updatedStep),
      content: updatedStep.content,
      data: this.targetParams.data,
      tenant: this.targetParams.tenant,
    };

    this.knock.user.markGuideStepAs<MarkAsSeenParams, MarkGuideAsResponse>(
      "seen",
      params,
    );

    return updatedStep;
  }

  async markAsInteracted(
    guide: KnockGuide,
    step: KnockGuideStep,
    metadata?: GenericData,
  ) {
    this.knock.log(
      `[Guide] Marking as interacted (Guide key: ${guide.key}, Step ref:${step.ref})`,
    );

    const ts = new Date().toISOString();
    const updatedStep = this.setStepMessageAttrs(guide.key, step.ref, {
      read_at: ts,
      interacted_at: ts,
    });
    if (!updatedStep) return;

    const params = {
      ...this.buildEngagementEventBaseParams(guide, updatedStep),
      metadata,
    };

    this.knock.user.markGuideStepAs<
      MarkAsInteractedParams,
      MarkGuideAsResponse
    >("interacted", params);

    return updatedStep;
  }

  async markAsArchived(guide: KnockGuide, step: KnockGuideStep) {
    this.knock.log(
      `[Guide] Marking as archived (Guide key: ${guide.key}, Step ref:${step.ref})`,
    );

    const updatedStep = this.setStepMessageAttrs(guide.key, step.ref, {
      archived_at: new Date().toISOString(),
    });
    if (!updatedStep) return;

    const params = this.buildEngagementEventBaseParams(guide, updatedStep);

    this.knock.user.markGuideStepAs<MarkAsArchivedParams, MarkGuideAsResponse>(
      "archived",
      params,
    );

    return updatedStep;
  }

  //
  // Helpers
  //

  private localCopy(remoteGuide: KnockGuide) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    // Build a local copy with helper methods added.
    const localGuide = { ...remoteGuide };

    localGuide.steps = remoteGuide.steps.map(({ message, ...rest }) => {
      const localStep = {
        ...rest,
        message: { ...message },
        markAsSeen() {
          // Send a seen event if it has not been previously seen.
          if (this.message.seen_at) return;
          return self.markAsSeen(localGuide, this);
        },
        markAsInteracted({ metadata }: { metadata?: GenericData } = {}) {
          // Always send an interaction event through.
          return self.markAsInteracted(localGuide, this, metadata);
        },
        markAsArchived() {
          // Send an archived event if it has not been previously archived.
          if (this.message.archived_at) return;
          return self.markAsArchived(localGuide, this);
        },
      };

      // Bind all engagement action handler methods to the local step object so
      // they can operate on itself.
      localStep.markAsSeen = localStep.markAsSeen.bind(localStep);
      localStep.markAsInteracted = localStep.markAsInteracted.bind(localStep);
      localStep.markAsArchived = localStep.markAsArchived.bind(localStep);

      return localStep;
    });

    return localGuide as KnockGuideWithHandlers;
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
    let updatedStep: KnockGuideStep<WithStepHandlers> | undefined;

    this.store.setState((state) => {
      const guides = state.guides.map((guide) => {
        if (guide.key !== guideKey) return guide;

        const steps = guide.steps.map((step) => {
          if (step.ref !== stepRef) return step;

          // Mutate in place and maintain the same obj ref so to make it easier
          // to use in hook deps.
          step.message = { ...step.message, ...attrs };
          updatedStep = step;

          return step;
        });
        return { ...guide, steps };
      });
      return { ...state, guides };
    });

    return updatedStep;
  }

  private buildEngagementEventBaseParams(
    guide: KnockGuide,
    step: KnockGuideStep<WithStepHandlers>,
  ) {
    return {
      message_id: step.message.id,
      channel_id: guide.channel_id,
      guide_key: guide.key,
      guide_id: guide.id,
      guide_step_ref: step.ref,
    };
  }

  private addGuide({ data }: GuideAddedEvent) {
    const guide = this.localCopy(data.guide);

    this.store.setState((state) => {
      return { ...state, guides: sortGuides([...state.guides, guide]) };
    });
  }

  private replaceOrAddGuide({ data }: GuideUpdatedEvent) {
    const guide = this.localCopy(data.guide);

    this.store.setState((state) => {
      let replaced = false;

      const guides = state.guides.map((g) => {
        if (g.key !== guide.key) return g;
        replaced = true;
        return guide;
      });

      return {
        ...state,
        guides: replaced ? sortGuides(guides) : sortGuides([...guides, guide]),
      };
    });
  }

  private removeGuide({ data }: GuideUpdatedEvent | GuideRemovedEvent) {
    this.store.setState((state) => {
      const guides = state.guides.filter((g) => g.key !== data.guide.key);
      return { ...state, guides };
    });
  }
}
