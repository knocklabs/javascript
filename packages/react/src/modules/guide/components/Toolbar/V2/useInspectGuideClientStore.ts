import {
  KnockGuide,
  KnockGuideClientStoreState,
  KnockGuideIneligibilityMarker,
  checkActivatable,
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

type AnnotatedStatuses = {
  // Individual eligibility statuses:
  active: ActiveStatus;
  targetable: TargetableStatus;
  archived: ArchivedStatus;
  // Individual qualified statuses:
  activatable: ActivatableStatus;
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

export const resolveIsQualified = ({ activatable }: AnnotatedStatuses) => {
  if (!activatable.status) return false;
  return true;
};

type StoreStateSnapshot = Pick<
  KnockGuideClientStoreState,
  "location" | "guides" | "guideGroups" | "ineligibleGuides" | "debug"
>;

const annotateGuide = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
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
  const snapshot = useStore(client.store, (state) => {
    return {
      location: state.location,
      guides: state.guides,
      guideGroups: state.guideGroups,
      ineligibleGuides: state.ineligibleGuides,
      debug: state.debug,
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

  // Annotate guides for various eligibility, activation and query statuses
  // that are useful for debugging purposes.
  const orderedGuides = defaultGroup.display_sequence.map((guideKey) => {
    const guide = snapshot.guides[guideKey];
    if (!guide) {
      return newUnknownGuide(guideKey);
    }

    return annotateGuide(guide, snapshot);
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
