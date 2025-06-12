import { GenericData } from "@knocklabs/types";
import { Store } from "@tanstack/store";
import { Channel, Socket } from "phoenix";
import { URLPattern } from "urlpattern-polyfill";

import Knock from "../../knock";

const formatFilters = (filters: SelectFilterParams = {}) => {
  return [
    filters.key && `key=${filters.key}`,
    filters.type && `type=${filters.type}`,
  ]
    .filter((x) => x)
    .join(", ");
};

const byKey = <T extends { key: string }>(items: T[]) => {
  return items.reduce((acc, item) => ({ ...acc, [item.key]: item }), {});
};

const sortGuides = <T extends GuideData>(guides: T[]) => {
  return [...guides].sort(
    (a, b) =>
      new Date(a.inserted_at).getTime() - new Date(b.inserted_at).getTime(),
  );
};

// Prefix with a special char just to be safe for any potential collision.
const NOTIONAL_GROUP_KEY = "$notional";

// Build a notional group to fall back on for ordering only without any limits.
// This is for backward compatibility purposes.
const buildNotionalGroup = (entries: GuideData[]) => {
  const now = new Date();

  return {
    __typename: "GuideGroup",
    key: NOTIONAL_GROUP_KEY,
    display_sequence: sortGuides(entries).map((g) => g.key),
    display_interval: null,
    inserted_at: now.toISOString(),
    updated_at: now.toISOString(),
  } as GuideGroupData;
};

class SelectionResult<K = number, V = KnockGuide> extends Map<K, V> {
  metadata: { guideGroup: GuideGroupData } | undefined;

  constructor() {
    super();
  }
}

const select = (state: StoreState, filters: SelectFilterParams = {}) => {
  // A map of selected guides as values, with its order index as keys.
  const result = new SelectionResult();

  // Currently we only support one global group at the moment.
  const defaultGroup = state.guideGroups[0];
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

//
// Guides API (via User client)
//

export const guidesApiRootPath = (userId: string | undefined | null) =>
  `/v1/users/${userId}/guides`;

interface StepMessageState {
  id: string;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
}

interface GuideStepData {
  ref: string;
  schema_key: string;
  schema_semver: string;
  schema_variant_key: string;
  message: StepMessageState;
  // eslint-disable-next-line
  content: any;
}

interface GuideActivationLocationRuleData {
  directive: "allow" | "block";
  pathname: string;
}

interface GuideData {
  __typename: "Guide";
  channel_id: string;
  id: string;
  key: string;
  type: string;
  semver: string;
  steps: GuideStepData[];
  activation_location_rules: GuideActivationLocationRuleData[];
  inserted_at: string;
  updated_at: string;
}

interface GuideGroupData {
  __typename: "GuideGroup";
  key: string;
  display_sequence: Array<GuideData["key"]>;
  display_interval: number | null;
  inserted_at: string;
  updated_at: string;
}

export interface KnockGuideStep extends GuideStepData {
  markAsSeen: () => void;
  markAsInteracted: (params?: { metadata?: GenericData }) => void;
  markAsArchived: () => void;
}

interface KnockGuideActivationLocationRule
  extends GuideActivationLocationRuleData {
  pattern: URLPattern;
}

export interface KnockGuide extends GuideData {
  steps: KnockGuideStep[];
  activation_location_rules: KnockGuideActivationLocationRule[];
}

type GetGuidesQueryParams = {
  data?: string;
  tenant?: string;
  type?: string;
};

type GetGuidesResponse = {
  entries: GuideData[];
  guide_groups: GuideGroupData[];
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
  { guide: GuideData; eligible: true }
>;

type GuideUpdatedEvent = SocketEventPayload<
  "guide.updated",
  { guide: GuideData; eligible: boolean }
>;

type GuideRemovedEvent = SocketEventPayload<
  "guide.removed",
  { guide: Pick<GuideData, "key"> }
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
  guideGroups: GuideGroupData[];
  guides: Record<KnockGuide["key"], KnockGuide>;
  queries: Record<QueryKey, QueryStatus>;
  counter: number;
  location: string | undefined;
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

type ConstructorOpts = {
  trackLocationFromWindow?: boolean;
  orderResolutionDuration?: number;
};

type GroupStage = {
  isOpen: boolean;
  ranked: Array<KnockGuide["key"]>;
  timeoutId: number | null;
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

  // Guides that are competing to render are staged first and ranked based on
  // its relative order in the group, to resolve the prevailing one.
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
      counter: 0,
      location,
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
        guideGroups: groups.length > 0 ? groups : [buildNotionalGroup(entries)],
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

  // XXX: Need to refactor this.
  private handleSocketEvent(_payload: GuideSocketEvent) {
    // const { event, data } = payload;
    //
    // switch (event) {
    //   // case "guide.added":
    //   //   return this.addGuide(payload);
    //   //
    //   // case "guide.updated":
    //   //   return data.eligible
    //   //     ? this.replaceOrAddGuide(payload)
    //   //     : this.removeGuide(payload);
    //   //
    //   // case "guide.removed":
    //   //   return this.removeGuide(payload);
    //
    //   default:
    //     return;
    // }
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

    const { orderResolutionDuration: timeoutDelay = 0 } = this.options;

    // TODO: Check if guide has ignore limit set, and if so return immediately.
    const [index, guide] = [...result][0]!;

    if (!this.stage) {
      this.knock.log(`[Guide] Opening a new group stage with: ${guide.key}`);

      const ranked = [];
      ranked[index] = guide.key;
      const timeoutId = setTimeout(() => this.closeGroupStage(), timeoutDelay);
      this.stage = { isOpen: true, ranked, timeoutId };

      return undefined;
    }

    if (this.stage.isOpen) {
      this.knock.log(`[Guide] Adding to the current group stage: ${guide.key}`);
      this.stage.ranked[index] = guide.key;

      return undefined;
    }

    // TODO: Need to check if this guide can render now based on the group's
    // display interval aka throttle limit.

    return this.stage.ranked[0] === guide.key ? guide : undefined;
  }

  private closeGroupStage() {
    if (!this.stage || !this.stage.isOpen) return;
    this.knock.log("[Guide] Closing the current group stage");

    this.stage = {
      isOpen: false,
      ranked: this.stage.ranked.filter((x) => x !== undefined),
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

  // XXX: Need to refactor this.
  private setStepMessageAttrs(
    _guideKey: string,
    _stepRef: string,
    _attrs: Partial<StepMessageState>,
  ) {
    let updatedStep: KnockGuideStep | undefined;

    // this.store.setState((state) => {
    //   const guides = state.guides.map((guide) => {
    //     if (guide.key !== guideKey) return guide;
    //
    //     const steps = guide.steps.map((step) => {
    //       if (step.ref !== stepRef) return step;
    //
    //       // Mutate in place and maintain the same obj ref so to make it easier
    //       // to use in hook deps.
    //       step.message = { ...step.message, ...attrs };
    //       updatedStep = step;
    //
    //       return step;
    //     });
    //     return { ...guide, steps };
    //   });
    //   return { ...state, guides };
    // });

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

  // XXX: Need to refactor this.
  // private addGuide({ data }: GuideAddedEvent) {
  //   const guide = this.localCopy(data.guide);
  //
  //   this.store.setState((state) => {
  //     return { ...state, guides: sortGuides([...state.guides, guide]) };
  //   });
  // }
  //
  // private replaceOrAddGuide({ data }: GuideUpdatedEvent) {
  //   const guide = this.localCopy(data.guide);
  //
  //   this.store.setState((state) => {
  //     let replaced = false;
  //
  //     const guides = state.guides.map((g) => {
  //       if (g.key !== guide.key) return g;
  //       replaced = true;
  //       return guide;
  //     });
  //
  //     return {
  //       ...state,
  //       guides: replaced ? sortGuides(guides) : sortGuides([...guides, guide]),
  //     };
  //   });
  // }
  //
  // private removeGuide({ data }: GuideUpdatedEvent | GuideRemovedEvent) {
  //   this.store.setState((state) => {
  //     const guides = state.guides.filter((g) => g.key !== data.guide.key);
  //     return { ...state, guides };
  //   });
  // }

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
