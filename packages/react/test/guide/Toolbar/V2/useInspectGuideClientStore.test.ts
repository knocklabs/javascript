import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import {
  type AnnotatedGuide,
  isUnknownGuide,
  useInspectGuideClientStore,
} from "../../../../src/modules/guide/components/Toolbar/V2/useInspectGuideClientStore";

// Mutable snapshot that tests can override to simulate different store states.
let mockStoreState: Record<string, unknown> = {};

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useGuideContext: () => ({
      client: { store: {} },
    }),
    useStore: vi.fn((_store, selector) => selector(mockStoreState)),
  };
});

const makeGuide = (overrides: Record<string, unknown> = {}) => ({
  __typename: "Guide",
  id: "guide-1",
  key: "guide_one",
  channel_id: "ch-1",
  type: "banner",
  semver: "1.0.0",
  active: true,
  steps: [],
  activation_url_rules: [],
  activation_url_patterns: [],
  bypass_global_group_limit: false,
  inserted_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  getStep: () => undefined,
  ...overrides,
});

const makeGuideGroup = (
  displaySequence: string[],
  overrides: Record<string, unknown> = {},
) => ({
  __typename: "GuideGroup",
  key: "default",
  display_sequence: displaySequence,
  display_sequence_unthrottled: null,
  display_sequence_throttled: null,
  display_interval: null,
  inserted_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  ...overrides,
});

const makeMarker = (
  key: string,
  reason: string,
  message = `Marker: ${reason}`,
) => ({
  __typename: "GuideIneligibilityMarker" as const,
  key,
  reason,
  message,
});

const setSnapshot = (partial: Record<string, unknown>) => {
  mockStoreState = {
    guides: {},
    guideGroups: [],
    ineligibleGuides: {},
    debug: { debugging: true },
    ...partial,
  };
};

// Shorthand for rendering the hook and extracting the result.
const renderInspect = () => {
  const { result } = renderHook(() => useInspectGuideClientStore());
  return result.current;
};

describe("useInspectGuideClientStore", () => {
  // ----- Early returns -----

  test("returns undefined when not in debugging mode", () => {
    setSnapshot({ debug: { debugging: false } });
    expect(renderInspect()).toBeUndefined();
  });

  test("returns undefined when debug is undefined", () => {
    setSnapshot({ debug: undefined });
    expect(renderInspect()).toBeUndefined();
  });

  test("returns error when there are no guide groups", () => {
    setSnapshot({ guideGroups: [] });
    const result = renderInspect();
    expect(result).toEqual({
      error: "no_guide_group",
      guides: [],
    });
  });

  // ----- Unknown guide -----

  test("produces an UnknownGuide when key is in display_sequence but not in guides", () => {
    setSnapshot({
      guideGroups: [makeGuideGroup(["missing_key"])],
      guides: {},
    });

    const result = renderInspect()!;
    expect(result.guides).toHaveLength(1);
    expect(isUnknownGuide(result.guides[0])).toBe(true);

    const unknown = result.guides[0]!;
    expect(unknown.key).toBe("missing_key");
    expect(unknown.active).toBe(false);
    expect(unknown.annotation.isEligible).toBe(false);
  });

  // ----- Guide annotation: fully eligible (no marker) -----

  test("annotates an active guide with no marker as eligible", () => {
    const guide = makeGuide({ key: "g1", active: true });
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: {},
    });

    const result = renderInspect()!;
    expect(result.guides).toHaveLength(1);

    const annotated = result.guides[0] as AnnotatedGuide;
    expect(annotated.annotation.isEligible).toBe(true);
    expect(annotated.annotation.active).toEqual({ status: true });
    expect(annotated.annotation.targetable).toEqual({ status: true });
    expect(annotated.annotation.archived).toEqual({ status: false });
  });

  // ----- Guide annotation: inactive -----

  test("annotates an inactive guide as ineligible", () => {
    const guide = makeGuide({ key: "g1", active: false });
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: {},
    });

    const result = renderInspect()!;
    const annotated = result.guides[0] as AnnotatedGuide;
    expect(annotated.annotation.isEligible).toBe(false);
    expect(annotated.annotation.active).toEqual({ status: false });
  });

  // ----- Guide annotation: target_conditions_not_met marker -----

  test("annotates a guide with target_conditions_not_met as not targetable and ineligible", () => {
    const guide = makeGuide({ key: "g1", active: true });
    const marker = makeMarker(
      "g1",
      "target_conditions_not_met",
      "User does not match conditions",
    );
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: { g1: marker },
    });

    const result = renderInspect()!;
    const annotated = result.guides[0] as AnnotatedGuide;
    expect(annotated.annotation.isEligible).toBe(false);
    expect(annotated.annotation.targetable).toEqual({
      status: false,
      reason: "target_conditions_not_met",
      message: "User does not match conditions",
    });
    // archived should be false since the reason is not "marked_as_archived"
    expect(annotated.annotation.archived).toEqual({ status: false });
  });

  // ----- Guide annotation: not_in_target_audience marker -----

  test("annotates a guide with not_in_target_audience as not targetable and ineligible", () => {
    const guide = makeGuide({ key: "g1", active: true });
    const marker = makeMarker(
      "g1",
      "not_in_target_audience",
      "Not in audience",
    );
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: { g1: marker },
    });

    const result = renderInspect()!;
    const annotated = result.guides[0] as AnnotatedGuide;
    expect(annotated.annotation.isEligible).toBe(false);
    expect(annotated.annotation.targetable).toEqual({
      status: false,
      reason: "not_in_target_audience",
      message: "Not in audience",
    });
    expect(annotated.annotation.archived).toEqual({ status: false });
  });

  // ----- Guide annotation: marked_as_archived marker -----

  test("annotates a guide with marked_as_archived as archived and ineligible", () => {
    const guide = makeGuide({ key: "g1", active: true });
    const marker = makeMarker("g1", "marked_as_archived", "Already dismissed");
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: { g1: marker },
    });

    const result = renderInspect()!;
    const annotated = result.guides[0] as AnnotatedGuide;
    expect(annotated.annotation.isEligible).toBe(false);
    // archived reason falls through the targetable switch default, so targetable stays true
    expect(annotated.annotation.targetable).toEqual({ status: true });
    expect(annotated.annotation.archived).toEqual({ status: true });
  });

  // ----- Guide annotation: unrecognized marker reason -----

  test("treats an unrecognized marker reason as still targetable and not archived", () => {
    const guide = makeGuide({ key: "g1", active: true });
    const marker = makeMarker(
      "g1",
      "some_unknown_reason",
      "Something happened",
    );
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: { g1: marker },
    });

    const result = renderInspect()!;
    const annotated = result.guides[0] as AnnotatedGuide;
    // Unknown reasons don't affect targetable or archived, so the guide is still eligible
    expect(annotated.annotation.isEligible).toBe(true);
    expect(annotated.annotation.targetable).toEqual({ status: true });
    expect(annotated.annotation.archived).toEqual({ status: false });
  });

  // ----- Ordering follows display_sequence -----

  test("returns guides ordered by display_sequence", () => {
    const guideA = makeGuide({ key: "a" });
    const guideB = makeGuide({ key: "b" });
    const guideC = makeGuide({ key: "c" });
    setSnapshot({
      guideGroups: [makeGuideGroup(["c", "a", "b"])],
      guides: { a: guideA, b: guideB, c: guideC },
      ineligibleGuides: {},
    });

    const result = renderInspect()!;
    expect(result.guides.map((g) => g.key)).toEqual(["c", "a", "b"]);
  });

  // ----- Mixed guides: eligible, ineligible, and unknown -----

  test("handles a mix of eligible, ineligible, and unknown guides", () => {
    const eligible = makeGuide({ key: "eligible", active: true });
    const inactive = makeGuide({ key: "inactive", active: false });
    const archived = makeGuide({ key: "archived", active: true });
    const archivedMarker = makeMarker(
      "archived",
      "marked_as_archived",
      "Dismissed",
    );

    setSnapshot({
      guideGroups: [
        makeGuideGroup(["eligible", "inactive", "archived", "unknown_key"]),
      ],
      guides: {
        eligible,
        inactive,
        archived,
      },
      ineligibleGuides: {
        archived: archivedMarker,
      },
    });

    const result = renderInspect()!;
    expect(result.guides).toHaveLength(4);

    // eligible guide
    const g0 = result.guides[0] as AnnotatedGuide;
    expect(g0.key).toBe("eligible");
    expect(g0.annotation.isEligible).toBe(true);

    // inactive guide
    const g1 = result.guides[1] as AnnotatedGuide;
    expect(g1.key).toBe("inactive");
    expect(g1.annotation.isEligible).toBe(false);
    expect(g1.annotation.active.status).toBe(false);

    // archived guide
    const g2 = result.guides[2] as AnnotatedGuide;
    expect(g2.key).toBe("archived");
    expect(g2.annotation.isEligible).toBe(false);
    expect(g2.annotation.archived.status).toBe(true);

    // unknown guide
    const g3 = result.guides[3]!;
    expect(g3.key).toBe("unknown_key");
    expect(isUnknownGuide(g3)).toBe(true);
    expect(g3.annotation.isEligible).toBe(false);
  });

  // ----- Annotated guide preserves original guide fields -----

  test("annotated guide preserves original guide fields", () => {
    const guide = makeGuide({
      key: "g1",
      id: "custom-id",
      type: "tooltip",
      active: true,
      bypass_global_group_limit: true,
    });
    setSnapshot({
      guideGroups: [makeGuideGroup(["g1"])],
      guides: { g1: guide },
      ineligibleGuides: {},
    });

    const result = renderInspect()!;
    const annotated = result.guides[0] as AnnotatedGuide;
    expect(annotated.id).toBe("custom-id");
    expect(annotated.type).toBe("tooltip");
    expect(annotated.bypass_global_group_limit).toBe(true);
    // annotation is added on top
    expect(annotated.annotation).toBeDefined();
  });

  // ----- Uses the first guide group (default group) -----

  test("uses the first guide group as the default group", () => {
    const guide = makeGuide({ key: "g1" });
    setSnapshot({
      guideGroups: [
        makeGuideGroup(["g1"], { key: "first" }),
        makeGuideGroup([], { key: "second" }),
      ],
      guides: { g1: guide },
      ineligibleGuides: {},
    });

    const result = renderInspect()!;
    expect(result.guides).toHaveLength(1);
    expect(result.guides[0]!.key).toBe("g1");
  });

  // ----- Eligibility resolution combinations -----

  describe("resolveIsEligible edge cases", () => {
    test("inactive + not targetable + archived = ineligible", () => {
      const guide = makeGuide({ key: "g1", active: false });
      const marker = makeMarker(
        "g1",
        "target_conditions_not_met",
        "Not targeted",
      );
      setSnapshot({
        guideGroups: [makeGuideGroup(["g1"])],
        guides: { g1: guide },
        ineligibleGuides: { g1: marker },
      });

      const result = renderInspect()!;
      const annotated = result.guides[0] as AnnotatedGuide;
      expect(annotated.annotation.isEligible).toBe(false);
      expect(annotated.annotation.active.status).toBe(false);
      expect(annotated.annotation.targetable.status).toBe(false);
    });

    test("active + targetable + not archived = eligible", () => {
      const guide = makeGuide({ key: "g1", active: true });
      setSnapshot({
        guideGroups: [makeGuideGroup(["g1"])],
        guides: { g1: guide },
        ineligibleGuides: {},
      });

      const result = renderInspect()!;
      const annotated = result.guides[0] as AnnotatedGuide;
      expect(annotated.annotation.isEligible).toBe(true);
    });
  });
});
