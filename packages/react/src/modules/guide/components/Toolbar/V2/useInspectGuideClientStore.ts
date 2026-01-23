import {
  KnockGuide,
  KnockGuideClientStoreState,
  KnockGuideIneligibilityMarker,
} from "@knocklabs/client";
import { useGuideContext, useStore } from "@knocklabs/react-core";

type ActiveStatus = {
  status: boolean;
};

type TargetableStatusTrue = {
  status: true;
};
type TargetableStatusFalse = {
  status: false;
  reason: string;
  message: string;
};
type TargetableStatus = TargetableStatusTrue | TargetableStatusFalse;

type ArchivedStatus = {
  status: boolean;
};

export type InspectedGuide = KnockGuide & {
  inspection: {
    // true status = good
    active: ActiveStatus;
    targetable: TargetableStatus;

    // false status = good
    archived: ArchivedStatus;
  };
};

export const checkEligible = (guide: InspectedGuide | MissingGuide) => {
  if (guide.__typename === "MissingGuide") return false;
  if (!guide.inspection.active.status) return false;
  if (!guide.inspection.targetable.status) return false;
  if (guide.inspection.archived.status) return false;

  return true;
};

// Exists and ordered in control but absent in switchboard (therefore not
// included in the api response), which implies a newly created guide that has
// never been published to switchboard.
export type MissingGuide = {
  __typename: "MissingGuide";
  key: KnockGuide["key"];
  active: false;
  bypass_global_group_limit: false;
};

export type InspectionResult = {
  guides: (InspectedGuide | MissingGuide)[];
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

const inspectGuide = (
  guide: KnockGuide,
  ineligibleGuides: KnockGuideClientStoreState["ineligibleGuides"],
): InspectedGuide => {
  const marker = ineligibleGuides[guide.key];

  const inspection: InspectedGuide["inspection"] = {
    active: { status: guide.active },
    targetable: marker ? toTargetableStatus(marker) : { status: true },
    archived: marker ? toArchivedStatus(marker) : { status: false },
  };

  return {
    ...guide,
    inspection,
  };
};

const newMissingGuide = (key: KnockGuide["key"]) =>
  ({
    __typename: "MissingGuide",
    key,
    active: false,
    bypass_global_group_limit: false,
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

  // Just for completeness, as there should always be a default group so this
  // should never happen.
  const defaultGroup = snapshot.guideGroups[0];
  if (!defaultGroup) {
    return {
      error: "no_guide_group",
      guides: [],
    };
  }

  // Transform the raw snapshot into something more useful for debugging.
  const orderedGuides = defaultGroup.display_sequence.map((guideKey) => {
    const guide = snapshot.guides[guideKey];
    if (!guide) {
      return newMissingGuide(guideKey);
    }

    return inspectGuide(guide, snapshot.ineligibleGuides);
  });

  return {
    guides: orderedGuides,
  };
};
