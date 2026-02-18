import {
  KnockGuide,
  KnockGuideClientGroupStage,
  KnockGuideClientStoreState,
  KnockGuideIneligibilityMarker,
  KnockGuideSelectionResult,
  checkActivatable,
  checkStateIfThrottled,
} from "@knocklabs/client";
import { useGuideContext, useStore } from "@knocklabs/react-core";

/**
 * This is the main module that will house core logic for the toolbar. It hooks
 * into the guide client state store, extracts relevant data for debugging, and
 * transforms it into easily consumable data for the toolbar - namely
 * "annotating" guides for its various statuses to display.
 */

// Active: `true` status = good
type ActiveStatus = {
  status: boolean;
};

// Targetable: `true` status = good
type TargetableStatusTrue = {
  status: true;
};
type TargetableStatusFalse = {
  status: false;
  reason: string;
  message: string;
};
type TargetableStatus = TargetableStatusTrue | TargetableStatusFalse;

type ActivatableStatus = {
  status: boolean;
};

// Archived: `false` status = good
type ArchivedStatus = {
  status: boolean;
};

// Selectable:
//  - "returned": Queried and resolved to return the guide from useGuide(s).
//  - "throttled": Queried and resolved but being throttled, so not yet returned.
//  - "queried": Queried but not resolved, because there are other higher
//    priority guides that are ahead of this guide in the query result.
//  - undefined: Not reachable with any of the given queries and filters.
type SelectionResultByLimit = {
  one?: KnockGuideSelectionResult;
  all?: KnockGuideSelectionResult;
};
type SelectionResultByQuery = {
  key?: SelectionResultByLimit;
  type?: SelectionResultByLimit;
};
type SelectableStatusPresent = {
  status: "returned" | "throttled" | "queried";
  query: SelectionResultByQuery;
};
type SelectableStatusAbsent = {
  status: undefined;
};
type SelectableStatus = SelectableStatusPresent | SelectableStatusAbsent;

type AnnotatedStatuses = {
  // Individual eligibility statuses:
  active: ActiveStatus;
  targetable: TargetableStatus;
  archived: ArchivedStatus;
  // Individual qualified statuses:
  activatable: ActivatableStatus;
  selectable: SelectableStatus;
};

type GuideAnnotation = AnnotatedStatuses & {
  // Resolved eligibility based on active, targetable and archived statuses,
  // which are backend driven evaluation results that are exposed for debugging.
  isEligible: boolean;

  // Resolved display qualification based on an activatable status, which
  // informs "when" and "where" an eligible guide can be displayed to user.
  isQualified: boolean;
};

export type AnnotatedGuide = KnockGuide & {
  annotation: GuideAnnotation;

  // Legacy fields, typed only to make tsc happy when we prune these out.
  activation_location_rules?: KnockGuide["activation_url_patterns"];
  priority?: number;
};

// Exists and ordered in control but absent in switchboard (therefore not
// included in the api response), which implies a newly created guide that has
// never been published to switchboard.
export type UnknownGuide = {
  __typename: "UnknownGuide";
  key: KnockGuide["key"];
  active: false;
  bypass_global_group_limit: false;
  annotation: {
    isEligible: false;
    isQualified: false;
  };
};

export type InspectionResult = {
  guides: (AnnotatedGuide | UnknownGuide)[];
  error?: "no_guide_group";
};

type StoreStateSnapshot = Pick<
  KnockGuideClientStoreState,
  | "location"
  | "guides"
  | "guideGroups"
  | "ineligibleGuides"
  | "debug"
  | "counter"
> & {
  throttled: boolean;
};

const inferSelectByKeyReturnStatus = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
  stage: KnockGuideClientGroupStage,
  query: SelectionResultByQuery,
): SelectableStatusPresent["status"] => {
  const includeThrottled =
    !!query.key?.one?.metadata?.opts?.includeThrottled ||
    !!query.key?.all?.metadata?.opts?.includeThrottled;

  // If unthrottled, then it should always be returned.
  if (guide.bypass_global_group_limit) {
    return "returned";
  }

  // If resolved, expect this guide to be returned unless being throttled.
  if (guide.key === stage.resolved) {
    if (snapshot.throttled && !includeThrottled) {
      return "throttled";
    }
    return "returned";
  }

  // If queried but not resolved, it means this guide is being shadowed by
  // another guide with higher priority because throttled guides can be
  // displayed only one at a time.
  return "queried";
};

const inferSelectOneByTypeReturnStatus = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
  stage: KnockGuideClientGroupStage,
  query: SelectionResultByQuery,
): SelectableStatusPresent["status"] => {
  const includeThrottled = !!query.type?.one?.metadata?.opts?.includeThrottled;

  const result = query.type!.one!;
  if (result.size === 0) {
    return "queried";
  }

  // There may be multiple unthrottled guides of the same type, being queried
  // by type to return a single guide, for example: useGuide({ type: "card" }).
  //
  // So it is possible for an unthrottled guide to be shadowed by another
  // unthrottled guide of the same type with higher priority, so we need to
  // look at the query result to determine its return status.
  if (guide.bypass_global_group_limit) {
    const guides = [...result.values()];
    const first = guides[0]!;

    if (guide.key !== first.key) {
      // Being shadowed by another guide with higher priority.
      return "queried";
    }
    return "returned";
  }

  // If resolved, expect this guide to be returned unless being throttled.
  if (guide.key === stage.resolved) {
    if (snapshot.throttled && !includeThrottled) {
      return "throttled";
    }
    return "returned";
  }

  // If queried but not resolved, it means this guide is being shadowed by
  // another guide with higher priority because throttled guides can be
  // displayed only one at a time.
  return "queried";
};

const inferSelectAllByTypeReturnStatus = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
  stage: KnockGuideClientGroupStage,
  query: SelectionResultByQuery,
): SelectableStatusPresent["status"] => {
  const result = query.type!.all!;
  if (result.size === 0) {
    return "queried";
  }

  const guides = [...result.values()];
  const first = guides[0]!;

  // If the first selected guide is unthrottled or resolved, then we should
  // have at minimum one guide to return, and potentially more based on whether
  // we are throttling currently and which other guides are unthrottled.
  if (first.bypass_global_group_limit || first.key === stage.resolved) {
    if (snapshot.throttled) {
      return guide.bypass_global_group_limit ? "returned" : "throttled";
    }
    return "returned";
  }

  return "queried";
};

const inferSelectReturnStatus = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
  stage: KnockGuideClientGroupStage,
  query: SelectionResultByQuery,
) => {
  // Querying by key can only return up to a max of one guide, regardless of
  // useGuide or useGuides, and should take precedence in status designation.
  if (query.key) {
    return inferSelectByKeyReturnStatus(guide, snapshot, stage, query);
  }

  if (query.type?.one) {
    return inferSelectOneByTypeReturnStatus(guide, snapshot, stage, query);
  }
  if (query.type?.all) {
    return inferSelectAllByTypeReturnStatus(guide, snapshot, stage, query);
  }

  // Should not happen but just for completeness.
  return undefined;
};

const toSelectableStatus = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
  stage: KnockGuideClientGroupStage | undefined,
): SelectableStatus => {
  if (!stage || stage.status === "open") {
    return { status: undefined };
  }

  const query = {
    key: (stage.results.key || {})[guide.key],
    type: (stage.results.type || {})[guide.type],
  };

  const queried = Boolean(query.key || query.type);
  if (!queried) {
    // No present query in the current location can select this guide.
    return { status: undefined };
  }

  const status = inferSelectReturnStatus(guide, snapshot, stage, query);
  if (!status) {
    return { status: undefined };
  }

  return { status, query };
};

const toIneligibilityStatus = (
  marker: KnockGuideIneligibilityMarker,
): Partial<AnnotatedStatuses> | undefined => {
  switch (marker.reason) {
    case "not_in_target_audience":
    case "target_conditions_not_met":
      return {
        targetable: {
          status: false,
          reason: marker.reason,
          message: marker.message,
        },
      };

    case "marked_as_archived":
      return {
        archived: {
          status: true,
        },
      };

    case "guide_not_active":
      return {
        active: {
          status: false,
        },
      };

    default:
      return undefined;
  }
};

const resolveIsEligible = ({
  active,
  targetable,
  archived,
}: AnnotatedStatuses) => {
  if (!active.status) return false;
  if (!targetable.status) return false;
  if (archived.status) return false;
  return true;
};

export const resolveIsQualified = ({
  activatable,
  selectable,
}: AnnotatedStatuses) => {
  if (!activatable.status) return false;
  if (!selectable.status) return false;
  return true;
};

const annotateGuide = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
  stage: KnockGuideClientGroupStage | undefined,
): AnnotatedGuide => {
  const { ineligibleGuides, location } = snapshot;
  const marker = ineligibleGuides[guide.key];
  const ineligiblity = marker ? toIneligibilityStatus(marker) : undefined;

  const statuses: AnnotatedStatuses = {
    // isEligible:
    active: ineligiblity?.active || { status: true },
    targetable: ineligiblity?.targetable || { status: true },
    archived: ineligiblity?.archived || { status: false },
    // isQualified:
    activatable: { status: checkActivatable(guide, location) },
    selectable: toSelectableStatus(guide, snapshot, stage),
  };

  const annotation: GuideAnnotation = {
    ...statuses,
    isEligible: resolveIsEligible(statuses),
    isQualified: resolveIsQualified(statuses),
  };

  return {
    ...guide,
    annotation,
  };
};

const newUnknownGuide = (key: KnockGuide["key"]) =>
  ({
    __typename: "UnknownGuide",
    key,
    active: false,
    bypass_global_group_limit: false,
    annotation: {
      isEligible: false,
      isQualified: false,
    },
  }) as UnknownGuide;

export const useInspectGuideClientStore = (): InspectionResult | undefined => {
  const { client } = useGuideContext();

  // Extract a snapshot of the client store state for debugging.
  const snapshot: StoreStateSnapshot = useStore(client.store, (state) => {
    const throttled = checkStateIfThrottled(state);

    return {
      location: state.location,
      guides: state.guides,
      guideGroups: state.guideGroups,
      ineligibleGuides: state.ineligibleGuides,
      debug: state.debug,
      counter: state.counter,
      throttled,
    };
  });

  // Not in debugging session, so noop.
  if (!snapshot.debug?.debugging) {
    return undefined;
  }

  // Only for completeness, as there should always be a default group so this
  // should never happen.
  const defaultGroup = snapshot.guideGroups[0];
  if (!defaultGroup) {
    return {
      error: "no_guide_group",
      guides: [],
    };
  }

  const groupStage = client.getStage();

  // Annotate guides for various eligibility, activation and query statuses
  // that are useful for debugging purposes.
  const orderedGuides = defaultGroup.display_sequence.map((guideKey) => {
    const guide = snapshot.guides[guideKey];
    if (!guide) {
      return newUnknownGuide(guideKey);
    }

    return annotateGuide(guide, snapshot, groupStage);
  });

  return {
    guides: orderedGuides,
  };
};

export const isUnknownGuide = (input: unknown): input is UnknownGuide =>
  typeof input === "object" &&
  input !== null &&
  "__typename" in input &&
  (input as UnknownGuide).__typename === "UnknownGuide";
