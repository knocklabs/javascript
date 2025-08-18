import { GenericData } from "@knocklabs/types";

//
// Fetch guides API
//

export interface StepMessageState {
  id: string;
  seen_at: string | null;
  read_at: string | null;
  interacted_at: string | null;
  archived_at: string | null;
  link_clicked_at: string | null;
}

export interface GuideStepData {
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

export interface GuideData {
  __typename: "Guide";
  channel_id: string;
  id: string;
  key: string;
  type: string;
  semver: string;
  steps: GuideStepData[];
  activation_location_rules: GuideActivationLocationRuleData[];
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
  message_id: string;
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
  | "guide_group.updated";

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

export type GuideSocketEvent =
  | GuideAddedEvent
  | GuideUpdatedEvent
  | GuideRemovedEvent
  | GuideGroupAddedEvent
  | GuideGroupUpdatedEvent;

//
// Guide client
//

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
  getStep: () => KnockGuideStep | undefined;
}

type QueryKey = string;

export type QueryStatus = {
  status: "loading" | "ok" | "error";
  error?: Error;
};

export type DebugState = {
  forcedGuideKey?: string | null;
};

export type StoreState = {
  guideGroups: GuideGroupData[];
  guideGroupDisplayLogs: Record<GuideGroupData["key"], string>;
  guides: Record<KnockGuide["key"], KnockGuide>;
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
