import { GenericData } from "@knocklabs/types";

//
// Fetch guides API
//

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any;

export interface StepMessageState {
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
}

export interface GuideStepData<TContent = Any> {
  ref: string;
  schema_key: string;
  schema_semver: string;
  schema_variant_key: string;
  message: StepMessageState;
  content: TContent;
}

export interface GuideActivationUrlRuleData {
  directive: "allow" | "block";
  variable: "pathname";
  operator: "equal_to" | "contains";
  argument: string;
}

interface GuideActivationUrlPatternData {
  directive: "allow" | "block";
  pathname: string;
}

export interface GuideData<TContent = Any> {
  __typename: "Guide";
  channel_id: string;
  id: string;
  key: string;
  type: string;
  semver: string;
  active: boolean;
  steps: GuideStepData<TContent>[];
  activation_url_rules: GuideActivationUrlRuleData[];
  activation_url_patterns: GuideActivationUrlPatternData[];
  bypass_global_group_limit: boolean;
  inserted_at: string;
  updated_at: string;
}

export interface GuideGroupData {
  __typename: "GuideGroup";
  key: string;
  display_sequence: Array<GuideData["key"]>;
  display_sequence_unthrottled: Array<GuideData["key"]> | null;
  display_sequence_throttled: Array<GuideData["key"]> | null;
  display_interval: number | null;
  inserted_at: string;
  updated_at: string;
}

export type GetGuidesQueryParams = {
  data?: string;
  tenant?: string;
  type?: string;
  force_all_guides?: boolean;
};

export type GetGuidesResponse = {
  entries: GuideData[];
  guide_groups: GuideGroupData[];
  guide_group_display_logs: Record<GuideGroupData["key"], string>;
};

//
// Engagement actions API
//

export type GuideEngagementEventBaseParams = {
  // Base params required for all engagement update events
  channel_id: string;
  guide_key: string;
  guide_id: string;
  guide_step_ref: string;
};

export type MarkAsSeenParams = GuideEngagementEventBaseParams & {
  // Rendered step content seen by the recipient
  content: GenericData;
  // Target params
  data?: GenericData;
  tenant?: string;
};
export type MarkAsInteractedParams = GuideEngagementEventBaseParams;
export type MarkAsArchivedParams = GuideEngagementEventBaseParams & {
  unthrottled?: boolean;
};

export type MarkGuideAsResponse = {
  status: "ok";
};

//
// Socket events
//

type SocketEventType =
  | "guide.added"
  | "guide.updated"
  | "guide.removed"
  | "guide_group.added"
  | "guide_group.updated"
  | "guide.live_preview_updated";

type SocketEventPayload<E extends SocketEventType, D> = {
  topic: string;
  event: E;
  data: D;
};

export type GuideAddedEvent = SocketEventPayload<
  "guide.added",
  { guide: GuideData; eligible: true }
>;

export type GuideUpdatedEvent = SocketEventPayload<
  "guide.updated",
  { guide: GuideData; eligible: boolean }
>;

export type GuideRemovedEvent = SocketEventPayload<
  "guide.removed",
  { guide: Pick<GuideData, "key"> }
>;

export type GuideGroupAddedEvent = SocketEventPayload<
  "guide_group.added",
  { guide_group: GuideGroupData }
>;

export type GuideGroupUpdatedEvent = SocketEventPayload<
  "guide_group.updated",
  { guide_group: GuideGroupData }
>;

export type GuideLivePreviewUpdatedEvent = SocketEventPayload<
  "guide.live_preview_updated",
  { guide: GuideData; eligible: boolean }
>;

export type GuideSocketEvent =
  | GuideAddedEvent
  | GuideUpdatedEvent
  | GuideRemovedEvent
  | GuideGroupAddedEvent
  | GuideGroupUpdatedEvent
  | GuideLivePreviewUpdatedEvent;

//
// Guide client
//

export interface KnockGuideStep<TContent = Any>
  extends GuideStepData<TContent> {
  markAsSeen: () => Promise<KnockGuideStep<TContent> | undefined>;
  markAsInteracted: (params?: {
    metadata?: GenericData;
  }) => Promise<KnockGuideStep<TContent> | undefined>;
  markAsArchived: () => Promise<KnockGuideStep<TContent> | undefined>;
}

export interface KnockGuideActivationUrlPattern
  extends GuideActivationUrlPatternData {
  pattern: URLPattern;
}

export interface KnockGuide<TContent = Any> extends GuideData<TContent> {
  steps: KnockGuideStep<TContent>[];
  activation_url_patterns: KnockGuideActivationUrlPattern[];
  getStep: () => KnockGuideStep<TContent> | undefined;
}

type QueryKey = string;

export type QueryStatus = {
  status: "loading" | "ok" | "error";
  error?: Error;
};

export type DebugState = {
  forcedGuideKey?: string | null;
  previewSessionId?: string | null;
};

export type StoreState = {
  guideGroups: GuideGroupData[];
  guideGroupDisplayLogs: Record<GuideGroupData["key"], string>;
  guides: Record<KnockGuide["key"], KnockGuide>;
  previewGuides: Record<KnockGuide["key"], KnockGuide>;
  queries: Record<QueryKey, QueryStatus>;
  location: string | undefined;
  counter: number;
  debug: DebugState;
};

export type QueryFilterParams = Pick<GetGuidesQueryParams, "type">;

export type SelectFilterParams = {
  key?: string;
  type?: string;
};

export type SelectGuideOpts = {
  includeThrottled?: boolean;
};

export type SelectGuidesOpts = SelectGuideOpts;

export type TargetParams = {
  data?: GenericData | undefined;
  tenant?: string | undefined;
};

export type ConstructorOpts = {
  trackLocationFromWindow?: boolean;
  orderResolutionDuration?: number;
  throttleCheckInterval?: number;
};

export type GroupStage = {
  status: "open" | "closed" | "patch";
  ordered: Array<KnockGuide["key"]>;
  resolved?: KnockGuide["key"];
  timeoutId: ReturnType<typeof setTimeout> | null;
};
