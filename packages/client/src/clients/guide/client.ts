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

// How long to wait until we resolve the guides order and determine the
// prevailing guide.
const DEFAULT_ORDER_RESOLUTION_DURATION = 50; // in milliseconds

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

  if (guide.steps.every((s) => !!s.message.archived_at)) {
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

const checkIfInsideThrottleWindow = (
  timestamp: string,
  durationInSeconds: number,
) => {
  // 1. Parse the original timestamp string into a Date object.
  // Date.parse() handles ISO 8601 strings correctly and returns milliseconds since epoch.
  // This inherently handles timezones by converting everything to a universal time representation (UTC).
  const throttleWindowStartedDate = new Date(timestamp);

  // Check if the original timestamp string was valid
  if (isNaN(throttleWindowStartedDate.getTime())) {
    return false;
  }

  // 2. Calculate the future timestamp by adding the duration to the original timestamp.
  // Convert duration from seconds to milliseconds.
  const durationInMilliseconds = durationInSeconds * 1000;
  const futureTimestampMilliseconds =
    throttleWindowStartedDate.getTime() + durationInMilliseconds;

  // 3. Get the current timestamp in milliseconds since epoch.
  const currentTimestampMilliseconds = new Date().getTime();

  // 4. Compare the current timestamp with the calculated future timestamp.
  // Both are in milliseconds since epoch (UTC), so direct comparison is accurate
  // regardless of local timezones.
  return currentTimestampMilliseconds <= futureTimestampMilliseconds;
};

export class KnockGuideClient {
  public store: Store<StoreState, (state: StoreState) => StoreState>;

  // Phoenix channels for real time guide updates over websocket
  private socket: Socket | undefined;
  private socketChannel: Channel | undefined;
  private socketChannelTopic: string;
  private socketEventTypes = [
    "guide.added",
    "guide.updated",
    "guide.removed",
    "guide_group.added",
    "guide_group.updated",
  ];

  // Original history methods to monkey patch, or restore in cleanups.
  private pushStateFn: History["pushState"] | undefined;
  private replaceStateFn: History["replaceState"] | undefined;

  // Guides that are competing to render are "staged" first without rendering
  // and ranked based on its relative order in the group over a duration of time
  // to resolve and render the prevailing one.
  private stage: GroupStage | undefined;

  private intervalId: number | undefined;

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
      guideGroupDisplayLogs: {},
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

    this.startRenderCounterLoop();

    this.knock.log("[Guide] Initialized a guide client");
  }

  private incrementCounter() {
    this.knock.log("[Guide] Incrementing the counter");
    this.store.setState((state) => ({ ...state, counter: state.counter + 1 }));
  }

  private startRenderCounterLoop() {
    this.intervalId = setInterval(() => {
      console.log("loop");
      if (this.stage && this.stage.status !== "closed") return;
      this.store.setState((state) => ({
        ...state,
        counter: state.counter + 1,
      }));
    }, 2000);
  }

  cleanup() {
    this.unsubscribe();
    this.removeEventListeners();
    this.clearGroupStage();
    this.clearInterval();
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

      const {
        entries,
        guide_groups: groups,
        guide_group_display_logs: guideGroupDisplayLogs,
      } = data;

      // console.log(2, guideGroupDisplayLogs);

      this.store.setState((state) => ({
        ...state,
        guideGroups: groups?.length > 0 ? groups : [mockDefaultGroup(entries)],
        guideGroupDisplayLogs,
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

      case "guide_group.added":
      case "guide_group.updated":
        return this.addOrReplaceGuideGroup(payload);

      default:
        return;
    }
  }

  setLocation(href: string) {
    // Make sure to clear out the stage.
    this.clearGroupStage();

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

    const [index, guide] = [...result][0]!;

    // If a guide ignores the group limit, then return immediately to render
    // always.
    if (guide.bypass_global_group_limit) {
      return guide;
    }

    // Check if inside the throttle window, and if so then stop.
    const throttleWindowStartedTs =
      this.store.state.guideGroupDisplayLogs[DEFAULT_GROUP_KEY];
    const [defaultGroup] = this.store.state.guideGroups;
    if (
      defaultGroup &&
      defaultGroup.display_interval &&
      throttleWindowStartedTs
    ) {
      const throttled = checkIfInsideThrottleWindow(
        throttleWindowStartedTs,
        defaultGroup.display_interval,
      );
      if (throttled) return undefined;
    }

    // Starting here to the end of this method represents the core logic of how
    // "group stage" works. It provides a mechanism for 1) figuring out which
    // guide components are about to render on a page, 2) determining which
    // among them ranks highest in the configured display sequence, and 3)
    // returning only the prevailing guide to render at a time.
    //
    // Imagine N number of components that use the `useGuide()` hook which
    // calls this `selectGuide()` method, and the logic works like this:
    // * The first time this method is called, we don't have an "open" group
    //   stage, so we open one (this occurs when a new page/route is rendering).
    //   * While it is open, we record which guide was selected and its order
    //     index from each call, but we do NOT return any guide to render yet.
    //   * When a group stage opens, it schedules a timer to close itself. How
    //     long this timer waits is configurable. Note, `setTimeout` with 0
    //     delay seems to work well for React apps, where we "yield" to React
    //     for one render cycle and close the group right after.
    // * When a group stage closes, we evaluate which guides were selected and
    //   recorded, then determine the winning guide (i.e. the one with the
    //   lowest order index value).
    //   * Then increment the internal counter to trigger a store state update,
    //     which allows `useGuide()` and `selectGuide()` to re-run. This second
    //     round of `selectGuide()` calls, occurring when the group stage is
    //     closed, results in returning the prevailing guide.
    // * Whenever a user navigates to a new page, we repeat the same process
    //   above.
    // * There's a third status called "patch," which is for handling real-time
    //   updates received from the API. It's similar to the "open" to "closed"
    //   flow, except we keep the resolved guide in place while we recalculate.
    //   This is done so that we don't cause flickers or CLS.
    if (!this.stage) {
      this.stage = this.openGroupStage(); // Assign here to make tsc happy
    }

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

  private openGroupStage() {
    this.knock.log("[Guide] Opening a new group stage");

    const {
      orderResolutionDuration: delay = DEFAULT_ORDER_RESOLUTION_DURATION,
    } = this.options;

    const timeoutId = setTimeout(() => {
      this.closePendingGroupStage();
      this.incrementCounter();
    }, delay);

    this.stage = {
      status: "open",
      ordered: [],
      timeoutId,
    };

    return this.stage;
  }

  // Close the current non-closed stage to resolve the prevailing guide up next
  // for display amongst the ones that have been staged.
  private closePendingGroupStage() {
    if (!this.stage || this.stage.status === "closed") return;

    this.knock.log("[Guide] Closing the current group stage");

    // Should have been cleared already since this method should be called as a
    // callback to a setTimeout, but just to be safe.
    this.ensureClearTimeout();

    this.stage = {
      ...this.stage,
      status: "closed",
      resolved: this.stage.ordered.find((x) => x !== undefined),
      timeoutId: null,
    };

    return this.stage;
  }

  // Set the current closed stage status to "patch" to allow re-running
  // selections and re-building a group stage with the latest/updated state,
  // while keeping the currently resolved guide in place so that it stays
  // rendered until we are ready to resolve the updated stage and re-render.
  // Note, must be called ahead of updating the state store.
  private patchClosedGroupStage() {
    if (this.stage?.status !== "closed") return;

    this.knock.log("[Guide] Patching the current group stage");

    const { orderResolutionDuration: delay = 0 } = this.options;

    const timeoutId = setTimeout(() => {
      this.closePendingGroupStage();
      this.incrementCounter();
    }, delay);

    // Just to be safe.
    this.ensureClearTimeout();

    this.stage = {
      ...this.stage,
      status: "patch",
      ordered: [],
      timeoutId,
    };

    return this.stage;
  }

  private clearGroupStage() {
    if (!this.stage) return;

    this.knock.log("[Guide] Clearing the current group stage");

    this.ensureClearTimeout();
    this.stage = undefined;
  }

  private ensureClearTimeout() {
    if (this.stage?.timeoutId) {
      clearTimeout(this.stage.timeoutId);
    }
  }

  // Test helper that opens and closes the group stage to return the select
  // result immediately.
  private _selectGuide(state: StoreState, filters: SelectFilterParams = {}) {
    this.openGroupStage();

    this.selectGuide(state, filters);
    this.closePendingGroupStage();

    return this.selectGuide(state, filters);
  }

  //
  // Engagement event handlers
  //
  // Make an optimistic update on the client side first, then send an engagement
  // event to the backend.
  //

  async markAsSeen(guide: GuideData, step: GuideStepData) {
    if (step.message.seen_at) return;

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
    if (step.message.archived_at) return;

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

      // If we are marking as archived, reset the group stage so we can render
      // the next guide in the group.
      const hasMarkedAsArchived = !!updatedStep && !!attrs.archived_at;
      if (hasMarkedAsArchived) {
        this.stage = undefined;
      }

      // Optimistically update the group display logs so we can apply the
      // throttle settings.
      const guideGroupDisplayLogs = hasMarkedAsArchived
        ? {
            ...state.guideGroupDisplayLogs,
            [DEFAULT_GROUP_KEY]: attrs.archived_at!,
          }
        : state.guideGroupDisplayLogs;

      return { ...state, guides, guideGroupDisplayLogs };
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
    this.patchClosedGroupStage();

    const guide = this.localCopy(data.guide);

    this.store.setState((state) => {
      const guides = { ...state.guides, [guide.key]: guide };

      return { ...state, guides };
    });
  }

  private removeGuide({ data }: GuideUpdatedEvent | GuideRemovedEvent) {
    this.patchClosedGroupStage();

    this.store.setState((state) => {
      const { [data.guide.key]: _, ...rest } = state.guides;
      return { ...state, guides: rest };
    });
  }

  private addOrReplaceGuideGroup({
    data,
  }: GuideGroupAddedEvent | GuideGroupUpdatedEvent) {
    this.patchClosedGroupStage();

    this.store.setState((state) => {
      const guideGroups = state.guideGroups.map((group) => {
        return group.key === data.guide_group.key ? data.guide_group : group;
      });

      const unthrottled = data.guide_group.display_sequence_unthrottled || [];
      const throttled = data.guide_group.display_sequence_throttled || [];
      let guides = state.guides;

      guides = unthrottled.reduce((acc, key) => {
        if (!acc[key]) return acc;
        const guide = { ...acc[key], bypass_global_group_limit: true };
        return { ...acc, [key]: guide };
      }, guides);

      guides = throttled.reduce((acc, key) => {
        if (!acc[key]) return acc;
        const guide = { ...acc[key], bypass_global_group_limit: false };
        return { ...acc, [key]: guide };
      }, guides);

      return { ...state, guides, guideGroups };
    });
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

  private clearInterval() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
  }
}
