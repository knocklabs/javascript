import {
  KnockGuide,
  KnockGuideClientStoreState,
  KnockGuideIneligibilityMarker,
} from "@knocklabs/client";
import { useGuideContext, useStore } from "@knocklabs/react-core";

const resolveIsEligible = ({
  active,
  targetable,
  archived,
}: Pick<GuideAnnotation, "active" | "targetable" | "archived">) => {
  if (!active.status) return false;
  if (!targetable.status) return false;
  if (archived.status) return false;
  return true;
};

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

// Archived: `false` status = good
type ArchivedStatus = {
  status: boolean;
};

type AnnotatedStatuses = {
  // Individual eligibility statuses:
  active: ActiveStatus;
  targetable: TargetableStatus;
  archived: ArchivedStatus;
};

export type GuideAnnotation = AnnotatedStatuses & {
  // Resolved eligibility based on active, targetable and archived statuses,
  // which are backend driven evaluation results that are exposed for debugging.
  isEligible: boolean;
};

export type AnnotatedGuide = KnockGuide & {
  annotation: GuideAnnotation;
};

// Exists and ordered in control but absent in switchboard (therefore not
// included in the api response), which implies a newly created guide that has
// never been published to switchboard.
export type MissingGuide = {
  __typename: "MissingGuide";
  key: KnockGuide["key"];
  active: false;
  bypass_global_group_limit: false;
  annotation: {
    isEligible: false;
  };
};

export type InspectionResult = {
  guides: (AnnotatedGuide | MissingGuide)[];
  error?: "no_guide_group";
};

const toTargetableStatus = (
  marker: KnockGuideIneligibilityMarker,
): TargetableStatus => {
  switch (marker.reason) {
    case "target_conditions_not_met":
    case "not_in_target_audience":
      return {
        status: false,
        reason: marker.reason,
        message: marker.message,
      };

    default:
      return {
        status: true,
      };
  }
};

const toArchivedStatus = (
  marker: KnockGuideIneligibilityMarker,
): ArchivedStatus => {
  return {
    status: marker.reason === "marked_as_archived",
  };
};

type StoreStateSnapshot = Pick<
  KnockGuideClientStoreState,
  "guides" | "guideGroups" | "ineligibleGuides" | "debug"
>;

const annotateGuide = (
  guide: KnockGuide,
  snapshot: StoreStateSnapshot,
): AnnotatedGuide => {
  const { ineligibleGuides } = snapshot;
  const marker = ineligibleGuides[guide.key];

  const statuses: AnnotatedStatuses = {
    active: { status: guide.active },
    targetable: marker ? toTargetableStatus(marker) : { status: true },
    archived: marker ? toArchivedStatus(marker) : { status: false },
  };

  const annotation: GuideAnnotation = {
    ...statuses,
    isEligible: resolveIsEligible(statuses),
  };

  return {
    ...guide,
    annotation,
  };
};

const newMissingGuide = (key: KnockGuide["key"]) =>
  ({
    __typename: "MissingGuide",
    key,
    active: false,
    bypass_global_group_limit: false,
    annotation: {
      isEligible: false,
    },
  }) as MissingGuide;

export const useInspectGuideClientStore = (): InspectionResult | undefined => {
  const { client } = useGuideContext();

  // Extract a snapshot of the client store state for debugging.
  const snapshot = useStore(client.store, (state) => {
    return {
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
      return newMissingGuide(guideKey);
    }

    return annotateGuide(guide, snapshot);
  });

  return {
    guides: orderedGuides,
  };
};
