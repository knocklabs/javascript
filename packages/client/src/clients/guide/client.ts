import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";
import { URLPattern } from "urlpattern-polyfill";

import Knock from "../../knock";

import {
  SelectionResult,
  byKey,
  findDefaultGroup,
  formatFilters,
  mockDefaultGroup,
} from "./helpers";
import {
  ConstructorOpts,
  GetGuidesQueryParams,
  GetGuidesResponse,
  GroupStage,
  GuideAddedEvent,
  GuideData,
  GuideRemovedEvent,
  GuideSocketEvent,
  GuideStepData,
  GuideUpdatedEvent,
  KnockGuide,
  KnockGuideStep,
  MarkAsArchivedParams,
  MarkAsInteractedParams,
  MarkAsSeenParams,
  MarkGuideAsResponse,
  QueryFilterParams,
  QueryStatus,
  SelectFilterParams,
  StepMessageState,
  StoreState,
  TargetParams,
} from "./types";

export const guidesApiRootPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

const select = (state: StoreState, filters: SelectFilterParams = {}) => {
  // A map of selected guides as values, with its order index as keys.
  const result = new SelectionResult();

  const defaultGroup = findDefaultGroup(state.guideGroups);
  if (!defaultGroup) return result;

  const displaySequence = defaultGroup.display_sequence;
  const location = state.location;

  for (const [index, guideKey] of displaySequence.entries()) {
    const guide = state.guides[guideKey];
    if (!guide) continue;

    const affirmed = predicate(guide, { location, filters });
    if (!affirmed) continue;

    result.set(index, guide);
  }

  result.metadata = { guideGroup: defaultGroup };
  return result;
};

type PredicateOpts = {
  location?: string | undefined;
  filters?: SelectFilterParams | undefined;
};

// TODO: Filter out archived guides once we implement throttling.
const predicate = (
  guide: KnockGuide,
  { location, filters = {} }: PredicateOpts,
) => {
  if (filters.type && filters.type !== guide.type) {
    return false;
  }

  if (filters.key && filters.key !== guide.key) {
    return false;
  }

  const locationRules = guide.activation_location_rules || [];

  if (locationRules.length > 0 && location) {
    const allowed = locationRules.reduce<boolean | undefined>((acc, rule) => {
      // Any matched block rule prevails so no need to evaluate further
      // as soon as there is one.
      if (acc === false) return false;

      // At this point we either have a matched allow rule (acc is true),
      // or no matched rule found yet (acc is undefined).

      switch (rule.directive) {
        case "allow": {
          // No need to evaluate more allow rules once we matched one
          // since any matched allowed rule means allow.
          if (acc === true) return true;

          const matched = rule.pattern.test(location);
          return matched ? true : undefined;
        }

        case "block": {
          // Always test block rules (unless already matched to block)
          // because they'd prevail over matched allow rules.
          const matched = rule.pattern.test(location);
          return matched ? false : acc;
        }
      }
    }, undefined);

    if (!allowed) return false;
  }

  return true;
};

export class KnockGuideClient {
  public store: Store<StoreState, (state: StoreState) => StoreState>;

  // Phoenix channels for real time guide updates over websocket
  private socket: Socket | undefined;
  private socketChannel: Channel | undefined;
  private socketChannelTopic: string;
  private socketEventTypes = ["guide.added", "guide.updated", "guide.removed"];

  // Original history methods to monkey patch, or restore in cleanups.
  private pushStateFn: History["pushState"] | undefined;
  private replaceStateFn: History["replaceState"] | undefined;

  // Guides that are competing to render are "staged" first without rendering
  // and ranked based on its relative order in the group over a duration of time
  // to resolve and render the prevailing one.
  private stage: GroupStage | undefined;

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
    readonly targetParams: TargetParams = {},
    readonly options: ConstructorOpts = {},
  ) {
    const { trackLocationFromWindow = true } = options;

    const location = trackLocationFromWindow
      ? window?.location.href
      : undefined;

    this.store = new Store<StoreState>({
      guideGroups: [],
      guides: {},
      queries: {},
      location,
      // Increment to update the state store and trigger re-selection.
      counter: 0,
    });

    // In server environments we might not have a socket connection.
    const { socket: maybeSocket } = this.knock.client();
    this.socket = maybeSocket;
    this.socketChannelTopic = `guides:${channelId}`;

    if (trackLocationFromWindow) {
      this.listenForLocationChangesFromWindow();
    }

    this.knock.log("[Guide] Initialized a guide client");
  }

  cleanup() {
    this.unsubscribe();
    this.removeEventListeners();
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

      const { entries, guide_groups: groups } = data;

      this.store.setState((state) => ({
        ...state,
        guideGroups: groups.length > 0 ? groups : [mockDefaultGroup(entries)],
        guides: byKey(entries.map((g) => this.localCopy(g))),
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
        return this.addOrReplaceGuide(payload);

      case "guide.updated":
        return data.eligible
          ? this.addOrReplaceGuide(payload)
          : this.removeGuide(payload);

      case "guide.removed":
        return this.removeGuide(payload);

      default:
        return;
    }
  }

  setLocation(href: string) {
    // Make sure to clear out the stage.
    this.stage = undefined;

    this.store.setState((state) => ({ ...state, location: href }));
  }

  //
  // Store selector
  //

  selectGuide(state: StoreState, filters: SelectFilterParams = {}) {
    if (Object.keys(state.guides).length === 0) {
      return undefined;
    }
    this.knock.log(`[Guide] Selecting guides for: ${formatFilters(filters)}`);

    const result = select(state, filters);
    if (result.size === 0) {
      this.knock.log("[Guide] Selection returned zero result");
      return undefined;
    }

    const { orderResolutionDuration: delay = 0 } = this.options;

    // TODO: Check if guide has ignore limit set, and if so return immediately.
    const [index, guide] = [...result][0]!;

    if (!this.stage) {
      this.knock.log(`[Guide] Opening a new group stage with: ${guide.key}`);

      const ordered = [];
      ordered[index] = guide.key;
      const timeoutId = setTimeout(() => this.closeGroupStage(), delay);
      this.stage = { status: "open", ordered, timeoutId };

      return undefined;
    }

    // TODO: Need to check if this guide can render now based on the group's
    // throttle limit.
    switch (this.stage.status) {
      case "open": {
        this.knock.log(`[Guide] Addng to the group stage: ${guide.key}`);
        this.stage.ordered[index] = guide.key;
        return undefined;
      }

      case "patch": {
        this.knock.log(`[Guide] Patching the group stage: ${guide.key}`);
        this.stage.ordered[index] = guide.key;
        return this.stage.resolved === guide.key ? guide : undefined;
      }

      case "closed": {
        return this.stage.resolved === guide.key ? guide : undefined;
      }
    }
  }

  // Close the stage and resolve the next guide up for display amongst the ones
  // that have been staged, then increment the counter to trigger re-render.
  private closeGroupStage() {
    if (!this.stage || this.stage.status === "closed") return;
    this.knock.log("[Guide] Closing the group stage");

    this.stage = {
      ...this.stage,
      status: "closed",
      resolved: this.stage.ordered.find((x) => x !== undefined),
      timeoutId: null,
    };

    this.store.setState((state) => ({ ...state, counter: state.counter + 1 }));
  }

  //
  // Engagement event handlers
  //
  // Make an optimistic update on the client side first, then send an engagement
  // event to the backend.
  //

  async markAsSeen(guide: GuideData, step: GuideStepData) {
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
    guide: GuideData,
    step: GuideStepData,
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

  async markAsArchived(guide: GuideData, step: GuideStepData) {
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

  private localCopy(remoteGuide: GuideData) {
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

    localGuide.activation_location_rules =
      remoteGuide.activation_location_rules.map((rule) => {
        return {
          ...rule,
          pattern: new URLPattern({ pathname: rule.pathname }),
        };
      });

    return localGuide as KnockGuide;
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
    let updatedStep: KnockGuideStep | undefined;

    this.store.setState((state) => {
      const guide = state.guides[guideKey];
      if (!guide) return state;

      const steps = guide.steps.map((step) => {
        if (step.ref !== stepRef) return step;

        // Mutate in place and maintain the same obj ref so to make it easier
        // to use in hook deps.
        step.message = { ...step.message, ...attrs };
        updatedStep = step;

        return step;
      });
      guide.steps = steps;

      const guides = { ...state.guides, [guide.key]: guide };
      return { ...state, guides };
    });

    return updatedStep;
  }

  private buildEngagementEventBaseParams(
    guide: GuideData,
    step: GuideStepData,
  ) {
    return {
      message_id: step.message.id,
      channel_id: guide.channel_id,
      guide_key: guide.key,
      guide_id: guide.id,
      guide_step_ref: step.ref,
    };
  }

  private addOrReplaceGuide({ data }: GuideAddedEvent | GuideUpdatedEvent) {
    const guide = this.localCopy(data.guide);

    this.maybePatchGroupStage();

    this.store.setState((state) => {
      const guides = { ...state.guides, [guide.key]: guide };

      return { ...state, guides };
    });
  }

  private removeGuide({ data }: GuideUpdatedEvent | GuideRemovedEvent) {
    this.maybePatchGroupStage();

    this.store.setState((state) => {
      const { [data.guide.key]: _, ...rest } = state.guides;
      return { ...state, guides: rest };
    });
  }

  // Set the stage status to "patch" so that we can re-run the stage evaluation
  // with the latest/updated state, while keeping the currently resolved guide
  // so that it stays rendered until we are finished. Note, must be called ahead
  // of updating the state store i.e. store.setState().
  private maybePatchGroupStage() {
    if (this.stage?.status === "closed") {
      const { orderResolutionDuration: delay = 0 } = this.options;
      const timeoutId = setTimeout(() => this.closeGroupStage(), delay);

      this.stage = {
        ...this.stage,
        status: "patch",
        ordered: [],
        timeoutId,
      };
    }
  }

  // Define as an arrow func property to always bind this to the class instance.
  private handleLocationChange = () => {
    const href = window.location.href;
    if (this.store.state.location === href) return;

    this.knock.log(`[Guide] Handle Location change: ${href}`);
    this.setLocation(href);
  };

  private listenForLocationChangesFromWindow() {
    if (window?.history) {
      // 1. Listen for browser back/forward button clicks.
      window.addEventListener("popstate", this.handleLocationChange);

      // 2. Listen for hash changes in case it's used for routing.
      window.addEventListener("hashchange", this.handleLocationChange);

      // 3. Monkey-patch history methods to catch programmatic navigation.
      const pushStateFn = window.history.pushState;
      const replaceStateFn = window.history.replaceState;

      // Use setTimeout to allow the browser state to potentially settle.
      window.history.pushState = new Proxy(pushStateFn, {
        apply: (target, history, args) => {
          Reflect.apply(target, history, args);
          setTimeout(() => {
            this.handleLocationChange();
          }, 0);
        },
      });
      window.history.replaceState = new Proxy(replaceStateFn, {
        apply: (target, history, args) => {
          Reflect.apply(target, history, args);
          setTimeout(() => {
            this.handleLocationChange();
          }, 0);
        },
      });

      // 4. Keep refs to the original handlers so we can restore during cleanup.
      this.pushStateFn = pushStateFn;
      this.replaceStateFn = replaceStateFn;
    } else {
      this.knock.log(
        "[Guide] Unable to access the `window.history` object to detect location changes",
      );
    }
  }

  private removeEventListeners() {
    window.removeEventListener("popstate", this.handleLocationChange);
    window.removeEventListener("hashchange", this.handleLocationChange);

    if (this.pushStateFn) {
      window.history.pushState = this.pushStateFn;
      this.pushStateFn = undefined;
    }
    if (this.replaceStateFn) {
      window.history.replaceState = this.replaceStateFn;
      this.replaceStateFn = undefined;
    }
  }
}
