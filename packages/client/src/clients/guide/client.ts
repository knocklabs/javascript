import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";
import { URLPattern } from "urlpattern-polyfill";

import Knock from "../../knock";

import {
  DEFAULT_GROUP_KEY,
  SelectionResult,
  byKey,
  checkStateIfThrottled,
  findDefaultGroup,
  formatFilters,
  formatGroupStage,
  formatState,
  mockDefaultGroup,
  newUrl,
  predicateUrlPatterns,
  predicateUrlRules,
} from "./helpers";
import {
  Any,
  ConstructorOpts,
  DebugState,
  GetGuidesQueryParams,
  GetGuidesResponse,
  GroupStage,
  GuideAddedEvent,
  GuideData,
  GuideGroupAddedEvent,
  GuideGroupUpdatedEvent,
  GuideLivePreviewUpdatedEvent,
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
  SelectGuideOpts,
  SelectGuidesOpts,
  StepMessageState,
  StoreState,
  TargetParams,
} from "./types";

// How long to wait until we resolve the guides order and determine the
// prevailing guide.
const DEFAULT_ORDER_RESOLUTION_DURATION = 50; // in milliseconds

// How often we should increment the counter to refresh the store state and
// trigger subscribed callbacks.
const DEFAULT_COUNTER_INCREMENT_INTERVAL = 30 * 1000; // in milliseconds

// Maximum number of retry attempts for channel subscription
const SUBSCRIBE_RETRY_LIMIT = 3;

// Debug query param keys
export const DEBUG_QUERY_PARAMS = {
  GUIDE_KEY: "knock_guide_key",
  PREVIEW_SESSION_ID: "knock_preview_session_id",
};

const DEBUG_STORAGE_KEY = "knock_guide_debug";

// Return the global window object if defined, so to safely guard against SSR.
const checkForWindow = () => {
  if (typeof window !== "undefined") {
    return window;
  }
};

export const guidesApiRootPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

// Detect debug params from URL or local storage
const detectDebugParams = (): DebugState => {
  const win = checkForWindow();
  if (!win) {
    return { forcedGuideKey: null, previewSessionId: null };
  }

  const urlParams = new URLSearchParams(win.location.search);
  const urlGuideKey = urlParams.get(DEBUG_QUERY_PARAMS.GUIDE_KEY);
  const urlPreviewSessionId = urlParams.get(
    DEBUG_QUERY_PARAMS.PREVIEW_SESSION_ID,
  );

  // If URL params exist, persist them to localStorage and return them
  if (urlGuideKey || urlPreviewSessionId) {
    if (win.localStorage) {
      try {
        const debugState = {
          forcedGuideKey: urlGuideKey,
          previewSessionId: urlPreviewSessionId,
        };
        win.localStorage.setItem(DEBUG_STORAGE_KEY, JSON.stringify(debugState));
      } catch {
        // Silently fail in privacy mode
      }
    }
    return {
      forcedGuideKey: urlGuideKey,
      previewSessionId: urlPreviewSessionId,
    };
  }

  // Check local storage if no URL params
  let storedGuideKey = null;
  let storedPreviewSessionId = null;

  if (win.localStorage) {
    try {
      const storedDebugState = win.localStorage.getItem(DEBUG_STORAGE_KEY);
      if (storedDebugState) {
        const parsedDebugState = safeJsonParseDebugParams(storedDebugState);
        storedGuideKey = parsedDebugState.forcedGuideKey;
        storedPreviewSessionId = parsedDebugState.previewSessionId;
      }
    } catch {
      // Silently fail in privacy mode
    }
  }

  return {
    forcedGuideKey: storedGuideKey,
    previewSessionId: storedPreviewSessionId,
  };
};

const safeJsonParseDebugParams = (value: string): DebugState => {
  try {
    const parsed = JSON.parse(value);
    return {
      forcedGuideKey: parsed?.forcedGuideKey ?? null,
      previewSessionId: parsed?.previewSessionId ?? null,
    };
  } catch {
    return {
      forcedGuideKey: null,
      previewSessionId: null,
    };
  }
};

const select = (state: StoreState, filters: SelectFilterParams = {}) => {
  // A map of selected guides as values, with its order index as keys.
  const result = new SelectionResult();

  const defaultGroup = findDefaultGroup(state.guideGroups);
  if (!defaultGroup) return result;

  const displaySequence = [...defaultGroup.display_sequence];
  const location = state.location;

  // If in debug mode, put the forced guide at the beginning of the display sequence.
  if (state.debug.forcedGuideKey) {
    const forcedKeyIndex = displaySequence.indexOf(state.debug.forcedGuideKey);
    if (forcedKeyIndex > -1) {
      displaySequence.splice(forcedKeyIndex, 1);
    }
    displaySequence.unshift(state.debug.forcedGuideKey);
  }

  for (const [index, guideKey] of displaySequence.entries()) {
    let guide = state.guides[guideKey];

    // Use preview guide if it exists and matches the forced guide key
    if (
      state.debug.forcedGuideKey === guideKey &&
      state.previewGuides[guideKey]
    ) {
      guide = state.previewGuides[guideKey];
    }

    if (!guide) continue;

    const affirmed = predicate(guide, {
      location,
      filters,
      debug: state.debug,
    });

    if (!affirmed) continue;

    result.set(index, guide);
  }

  result.metadata = { guideGroup: defaultGroup };
  return result;
};

type PredicateOpts = {
  location?: string | undefined;
  filters?: SelectFilterParams | undefined;
  debug: DebugState;
};

const predicate = (
  guide: KnockGuide,
  { location, filters = {}, debug = {} }: PredicateOpts,
) => {
  if (filters.type && filters.type !== guide.type) {
    return false;
  }

  if (filters.key && filters.key !== guide.key) {
    return false;
  }

  // Bypass filtering if the debugged guide matches the given filters.
  // This should always run AFTER checking the filters but BEFORE
  // checking archived status and location rules.
  if (debug.forcedGuideKey === guide.key) {
    return true;
  }

  if (!guide.active) {
    return false;
  }

  if (guide.steps.every((s) => !!s.message.archived_at)) {
    return false;
  }

  const url = location ? newUrl(location) : undefined;

  const urlRules = guide.activation_url_rules || [];
  const urlPatterns = guide.activation_url_patterns || [];

  // A guide can have either activation url rules XOR url patterns, but not both.
  if (url && urlRules.length > 0) {
    const allowed = predicateUrlRules(url, urlRules);
    if (!allowed) return false;
  } else if (url && urlPatterns.length > 0) {
    const allowed = predicateUrlPatterns(url, urlPatterns);
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
  private socketEventTypes = [
    "guide.added",
    "guide.updated",
    "guide.removed",
    "guide_group.added",
    "guide_group.updated",
    "guide.live_preview_updated",
  ];
  private subscribeRetryCount = 0;

  // Original history methods to monkey patch, or restore in cleanups.
  private pushStateFn: History["pushState"] | undefined;
  private replaceStateFn: History["replaceState"] | undefined;

  // Guides that are competing to render are "staged" first without rendering
  // and ranked based on its relative order in the group over a duration of time
  // to resolve and render the prevailing one.
  private stage: GroupStage | undefined;

  private counterIntervalId: ReturnType<typeof setInterval> | undefined;

  constructor(
    readonly knock: Knock,
    readonly channelId: string,
    readonly targetParams: TargetParams = {},
    readonly options: ConstructorOpts = {},
  ) {
    const {
      trackLocationFromWindow = true,
      throttleCheckInterval = DEFAULT_COUNTER_INCREMENT_INTERVAL,
    } = options;
    const win = checkForWindow();

    const location = trackLocationFromWindow ? win?.location.href : undefined;

    const debug = detectDebugParams();

    this.store = new Store<StoreState>({
      guideGroups: [],
      guideGroupDisplayLogs: {},
      guides: {},
      previewGuides: {},
      queries: {},
      location,
      // Increment to update the state store and trigger re-selection.
      counter: 0,
      debug,
    });

    // In server environments we might not have a socket connection.
    const { socket: maybeSocket } = this.knock.client();
    this.socket = maybeSocket;
    this.socketChannelTopic = `guides:${channelId}`;

    if (trackLocationFromWindow) {
      this.listenForLocationChangesFromWindow();
    }

    if (throttleCheckInterval) {
      // Start the counter loop to increment at an interval.
      this.startCounterInterval(throttleCheckInterval);
    }

    this.knock.log("[Guide] Initialized a guide client");
  }

  private incrementCounter() {
    this.knock.log("[Guide] Incrementing the counter");
    this.store.setState((state) => ({ ...state, counter: state.counter + 1 }));
  }

  private startCounterInterval(delay: number) {
    this.counterIntervalId = setInterval(() => {
      this.knock.log("[Guide] Counter interval tick");
      if (this.stage && this.stage.status !== "closed") return;

      this.incrementCounter();
    }, delay);
  }

  private clearCounterInterval() {
    if (this.counterIntervalId) {
      clearInterval(this.counterIntervalId);
      this.counterIntervalId = undefined;
    }
  }

  cleanup() {
    this.unsubscribe();
    this.removeLocationChangeEventListeners();
    this.clearGroupStage();
    this.clearCounterInterval();
  }

  async fetch(opts?: { filters?: QueryFilterParams }) {
    this.knock.log("[Guide] .fetch");

    if (!this.knock.isAuthenticated()) {
      this.knock.log("[Guide] Skipping fetch - user not authenticated");
      return {
        status: "error" as const,
        error: new Error("Not authenticated"),
      };
    }

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
      this.knock.log("[Guide] Fetching all eligible guides");
      const data = await this.knock.user.getGuides<
        GetGuidesQueryParams,
        GetGuidesResponse
      >(this.channelId, queryParams);
      queryStatus = { status: "ok" };

      const { entries, guide_groups: groups, guide_group_display_logs } = data;

      this.knock.log("[Guide] Loading fetched guides");
      this.store.setState((state) => ({
        ...state,
        guideGroups: groups?.length > 0 ? groups : [mockDefaultGroup(entries)],
        guideGroupDisplayLogs: guide_group_display_logs || {},
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

    if (!this.knock.isAuthenticated()) {
      this.knock.log("[Guide] Skipping subscribe - user not authenticated");
      return;
    }

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
    const debugState = this.store.state.debug;
    const params = {
      ...this.targetParams,
      user_id: this.knock.userId,
      force_all_guides: debugState.forcedGuideKey ? true : undefined,
      preview_session_id: debugState.previewSessionId || undefined,
    };

    const newChannel = this.socket.channel(this.socketChannelTopic, params);

    for (const eventType of this.socketEventTypes) {
      newChannel.on(eventType, (payload) => this.handleSocketEvent(payload));
    }

    if (["closed", "errored"].includes(newChannel.state)) {
      // Reset retry count for new subscription attempt
      this.subscribeRetryCount = 0;

      newChannel
        .join()
        .receive("ok", () => {
          this.knock.log("[Guide] Successfully joined channel");
        })
        .receive("error", (resp) => {
          this.knock.log(
            `[Guide] Failed to join channel: ${JSON.stringify(resp)}`,
          );
          this.handleChannelJoinError();
        })
        .receive("timeout", () => {
          this.knock.log("[Guide] Channel join timed out");
          this.handleChannelJoinError();
        });
    }

    // Track the joined channel.
    this.socketChannel = newChannel;
  }

  private handleChannelJoinError() {
    // Prevent phx channel from retrying forever in case of either network or
    // other errors (e.g. auth error, invalid channel etc)
    if (this.subscribeRetryCount >= SUBSCRIBE_RETRY_LIMIT) {
      this.knock.log(
        `[Guide] Channel join max retry limit reached: ${this.subscribeRetryCount}`,
      );
      this.unsubscribe();
      return;
    }

    this.subscribeRetryCount++;
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

      case "guide.live_preview_updated":
        return this.updatePreviewGuide(payload);

      default:
        return;
    }
  }

  setLocation(href: string, additionalParams: Partial<StoreState> = {}) {
    this.knock.log(`[Guide] .setLocation (loc=${href})`);

    // Make sure to clear out the stage.
    this.clearGroupStage();

    this.knock.log("[Guide] Updating the tracked location");
    this.store.setState((state) => {
      // Clear preview guides if no longer in preview mode
      const previewGuides = additionalParams?.debug?.previewSessionId
        ? state.previewGuides
        : {};

      return {
        ...state,
        ...additionalParams,
        previewGuides,
        location: href,
      };
    });
  }

  exitDebugMode() {
    this.knock.log("[Guide] Exiting debug mode");

    // Clear localStorage debug params
    const win = checkForWindow();
    if (win?.localStorage) {
      try {
        win.localStorage.removeItem(DEBUG_STORAGE_KEY);
      } catch {
        // Silently fail in privacy mode
      }
    }

    // Clear debug state from store
    this.store.setState((state) => ({
      ...state,
      debug: { forcedGuideKey: null, previewSessionId: null },
      previewGuides: {}, // Clear preview guides when exiting debug mode
    }));

    // Remove URL query params if present
    // Only update the URL if params need to be cleared to avoid unnecessary navigations
    if (win) {
      const url = new URL(win.location.href);
      if (
        url.searchParams.has(DEBUG_QUERY_PARAMS.GUIDE_KEY) ||
        url.searchParams.has(DEBUG_QUERY_PARAMS.PREVIEW_SESSION_ID)
      ) {
        url.searchParams.delete(DEBUG_QUERY_PARAMS.GUIDE_KEY);
        url.searchParams.delete(DEBUG_QUERY_PARAMS.PREVIEW_SESSION_ID);
        win.location.href = url.toString();
      }
    }
  }

  //
  // Store selector
  //

  selectGuides<C = Any>(
    state: StoreState,
    filters: SelectFilterParams = {},
    opts: SelectGuidesOpts = {},
  ): KnockGuide<C>[] {
    this.knock.log(
      `[Guide] .selectGuides (filters: ${formatFilters(filters)}; state: ${formatState(state)})`,
    );

    const selectedGuide = this.selectGuide(state, filters, opts);
    if (!selectedGuide) {
      return [];
    }

    // There should be at least one guide to return here now.
    const guides = [...select(state, filters).values()];

    if (!opts.includeThrottled && checkStateIfThrottled(state)) {
      const unthrottledGuides = guides.filter(
        (g) => g.bypass_global_group_limit,
      );
      const throttledCount = guides.length - unthrottledGuides.length;
      this.knock.log(
        `[Guide] Throttling ${throttledCount} guides from selection, and returning ${unthrottledGuides.length} guides`,
      );

      return unthrottledGuides;
    }

    this.knock.log(`[Guide] Returning ${guides.length} guides from selection`);
    return guides;
  }

  selectGuide<C = Any>(
    state: StoreState,
    filters: SelectFilterParams = {},
    opts: SelectGuideOpts = {},
  ): KnockGuide<C> | undefined {
    this.knock.log(
      `[Guide] .selectGuide (filters: ${formatFilters(filters)}; state: ${formatState(state)})`,
    );
    if (
      Object.keys(state.guides).length === 0 &&
      Object.keys(state.previewGuides).length === 0
    ) {
      this.knock.log("[Guide] Exiting selection (no guides)");
      return undefined;
    }

    const result = select(state, filters);

    if (result.size === 0) {
      this.knock.log("[Guide] Selection found zero result");
      return undefined;
    }

    const [index, guide] = [...result][0]!;
    this.knock.log(
      `[Guide] Selection found: \`${guide.key}\` (total: ${result.size})`,
    );

    // If a guide ignores the group limit, then return immediately to render
    // always.
    if (guide.bypass_global_group_limit) {
      this.knock.log(`[Guide] Returning the unthrottled guide: ${guide.key}`);
      return guide;
    }

    // Check if inside the throttle window (i.e. throttled) and if so stop and
    // return undefined unless explicitly given the option to include throttled.
    if (!opts.includeThrottled && checkStateIfThrottled(state)) {
      this.knock.log(`[Guide] Throttling the selected guide: ${guide.key}`);
      return undefined;
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
        this.knock.log(`[Guide] Adding to the group stage: ${guide.key}`);
        this.stage.ordered[index] = guide.key;
        return undefined;
      }

      case "patch": {
        this.knock.log(`[Guide] Patching the group stage: ${guide.key}`);
        this.stage.ordered[index] = guide.key;

        const ret = this.stage.resolved === guide.key ? guide : undefined;
        this.knock.log(
          `[Guide] Returning \`${ret?.key}\` (stage: ${formatGroupStage(this.stage)})`,
        );
        return ret;
      }

      case "closed": {
        const ret = this.stage.resolved === guide.key ? guide : undefined;
        this.knock.log(
          `[Guide] Returning \`${ret?.key}\` (stage: ${formatGroupStage(this.stage)})`,
        );
        return ret;
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
    this.knock.log("[Guide] .closePendingGroupStage");
    if (!this.stage || this.stage.status === "closed") return;

    // Should have been cleared already since this method should be called as a
    // callback to a setTimeout, but just to be safe.
    this.ensureClearTimeout();

    // If in debug mode, try to resolve the forced guide, otherwise return the first non-undefined guide.
    let resolved = undefined;
    if (this.store.state.debug.forcedGuideKey) {
      resolved = this.stage.ordered.find(
        (x) => x === this.store.state.debug.forcedGuideKey,
      );
    }

    if (!resolved) {
      resolved = this.stage.ordered.find((x) => x !== undefined);
    }

    this.knock.log(
      `[Guide] Closing the current group stage: resolved=${resolved}`,
    );

    this.stage = {
      ...this.stage,
      status: "closed",
      resolved,
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
    this.knock.log("[Guide] .patchClosedGroupStage");
    if (this.stage?.status !== "closed") return;

    const { orderResolutionDuration: delay = 0 } = this.options;

    const timeoutId = setTimeout(() => {
      this.closePendingGroupStage();
      this.incrementCounter();
    }, delay);

    // Just to be safe.
    this.ensureClearTimeout();

    this.knock.log("[Guide] Patching the current group stage");

    this.stage = {
      ...this.stage,
      status: "patch",
      ordered: [],
      timeoutId,
    };

    return this.stage;
  }

  private clearGroupStage() {
    this.knock.log("[Guide] .clearGroupStage");
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

  // Test helpers to open and close the group stage to return the select result
  // immediately.
  private _selectGuide(
    state: StoreState,
    filters: SelectFilterParams = {},
    opts: SelectGuideOpts = {},
  ) {
    this.openGroupStage();

    this.selectGuide(state, filters, opts);
    this.closePendingGroupStage();

    return this.selectGuide(state, filters, opts);
  }

  private _selectGuides(
    state: StoreState,
    filters: SelectFilterParams = {},
    opts: SelectGuidesOpts = {},
  ) {
    this.openGroupStage();

    this.selectGuides(state, filters, opts);
    this.closePendingGroupStage();

    return this.selectGuides(state, filters, opts);
  }

  //
  // Engagement event handlers
  //
  // Make an optimistic update on the client side first, then send an engagement
  // event to the backend.
  //

  async markAsSeen(guide: GuideData, step: GuideStepData) {
    if (step.message.seen_at) return;

    if (!this.knock.isAuthenticated()) {
      this.knock.log("[Guide] Skipping markAsSeen - user not authenticated");
      return;
    }

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
    if (!this.knock.isAuthenticated()) {
      this.knock.log(
        "[Guide] Skipping markAsInteracted - user not authenticated",
      );
      return;
    }

    this.knock.log(
      `[Guide] Marking as interacted (Guide key: ${guide.key}; Step ref:${step.ref})`,
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

    if (!this.knock.isAuthenticated()) {
      this.knock.log(
        "[Guide] Skipping markAsArchived - user not authenticated",
      );
      return;
    }

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
      {
        ...params,
        unthrottled: guide.bypass_global_group_limit,
      },
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
    const localGuide = {
      ...remoteGuide,
      // Get the next unarchived step.
      getStep() {
        // If debugging this guide, return the first step regardless of archive status
        if (self.store.state.debug.forcedGuideKey === this.key) {
          return this.steps[0];
        }

        return this.steps.find((s) => !s.message.archived_at);
      },
    } as KnockGuide;

    localGuide.getStep = localGuide.getStep.bind(localGuide);

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

    localGuide.activation_url_patterns =
      remoteGuide.activation_url_patterns.map((rule) => {
        return {
          ...rule,
          pattern: new URLPattern({ pathname: rule.pathname }),
        };
      });

    return localGuide;
  }

  private buildQueryParams(filterParams: QueryFilterParams = {}) {
    // Combine the target params with the given filter params.
    const combinedParams: GenericData = {
      ...this.targetParams,
      ...filterParams,
    };

    // Append debug params
    const debugState = this.store.state.debug;
    if (debugState.forcedGuideKey) {
      combinedParams.force_all_guides = true;
    }

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

    // If we are marking as archived, clear the group stage so we can render
    // the next guide in the group.
    if (attrs.archived_at) {
      this.clearGroupStage();
    }

    this.store.setState((state) => {
      let guide = state.guides[guideKey];
      if (!guide) return state;

      const steps = guide.steps.map((step) => {
        if (step.ref !== stepRef) return step;

        // Mutate in place and maintain the same obj ref so to make it easier
        // to use in hook deps.
        step.message = { ...step.message, ...attrs };
        updatedStep = step;

        return step;
      });
      // If updated, return the guide as a new object so useStore can trigger.
      guide = updatedStep ? { ...guide, steps } : guide;

      const guides = { ...state.guides, [guide.key]: guide };

      // If the guide is subject to throttled settings and we are marking as
      // archived, then update the display logs to start a new throttle window.
      const guideGroupDisplayLogs =
        attrs.archived_at && !guide.bypass_global_group_limit
          ? {
              ...state.guideGroupDisplayLogs,
              [DEFAULT_GROUP_KEY]: attrs.archived_at,
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
      channel_id: guide.channel_id,
      guide_key: guide.key,
      guide_id: guide.id,
      guide_step_ref: step.ref,
      // Can be used for scoping guide messages.
      tenant: this.targetParams.tenant,
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
      // Currently we only support a single default global group, so we can just
      // update the list with the added/updated group.
      const guideGroups = [data.guide_group];

      // A guide group event can include lists of unthrottled vs throttled guide
      // keys which we can use to bulk update the guides in the store already.
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

  private updatePreviewGuide({ data }: GuideLivePreviewUpdatedEvent) {
    const guide = this.localCopy(data.guide);

    this.store.setState((state) => {
      const previewGuides = { ...state.previewGuides, [guide.key]: guide };
      return { ...state, previewGuides };
    });
  }

  // Define as an arrow func property to always bind this to the class instance.
  private handleLocationChange = () => {
    this.knock.log(`[Guide] .handleLocationChange`);
    const win = checkForWindow();
    if (!win?.location) return;

    const href = win.location.href;
    if (this.store.state.location === href) return;

    this.knock.log(`[Guide] Detected a location change: ${href}`);

    // If entering debug mode, fetch all guides.
    const currentDebugParams = this.store.state.debug;
    const newDebugParams = detectDebugParams();

    this.setLocation(href, { debug: newDebugParams });

    // If debug state has changed, refetch guides and resubscribe to the websocket channel
    const debugStateChanged = this.checkDebugStateChanged(
      currentDebugParams,
      newDebugParams,
    );

    if (debugStateChanged) {
      this.knock.log(
        `[Guide] Debug state changed, refetching guides and resubscribing to the websocket channel`,
      );
      this.fetch();
      this.subscribe();
    }
  };

  // Returns whether debug params have changed. For guide key, we only check
  // presence since the exact value has no impact on fetch/subscribe
  private checkDebugStateChanged(a: DebugState, b: DebugState): boolean {
    return (
      Boolean(a.forcedGuideKey) !== Boolean(b.forcedGuideKey) ||
      a.previewSessionId !== b.previewSessionId
    );
  }

  private listenForLocationChangesFromWindow() {
    const win = checkForWindow();
    if (win?.history) {
      // 1. Listen for browser back/forward button clicks.
      win.addEventListener("popstate", this.handleLocationChange);

      // 2. Listen for hash changes in case it's used for routing.
      win.addEventListener("hashchange", this.handleLocationChange);

      // 3. Monkey-patch history methods to catch programmatic navigation.
      const pushStateFn = win.history.pushState;
      const replaceStateFn = win.history.replaceState;

      // Use setTimeout to allow the browser state to potentially settle.
      win.history.pushState = new Proxy(pushStateFn, {
        apply: (target, history, args) => {
          Reflect.apply(target, history, args);
          setTimeout(() => {
            this.handleLocationChange();
          }, 0);
        },
      });
      win.history.replaceState = new Proxy(replaceStateFn, {
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

  removeLocationChangeEventListeners() {
    const win = checkForWindow();
    if (!win?.history) return;

    win.removeEventListener("popstate", this.handleLocationChange);
    win.removeEventListener("hashchange", this.handleLocationChange);

    if (this.pushStateFn) {
      win.history.pushState = this.pushStateFn;
      this.pushStateFn = undefined;
    }
    if (this.replaceStateFn) {
      win.history.replaceState = this.replaceStateFn;
      this.replaceStateFn = undefined;
    }
  }
}
