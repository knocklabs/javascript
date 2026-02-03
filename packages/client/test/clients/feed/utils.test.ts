import { describe, expect, test } from "vitest";

import type {
  FeedClientOptions,
  FeedItem,
  TriggerData,
} from "../../../src/clients/feed/interfaces";
import {
  deduplicateItems,
  getFormattedExclude,
  getFormattedTriggerData,
  mergeDateRangeParams,
  sortItems,
} from "../../../src/clients/feed/utils";

describe("feed utils", () => {
  describe("deduplicateItems", () => {
    test("removes duplicate items by id", () => {
      const items: FeedItem[] = [
        {
          id: "1",
          __cursor: "cursor_1",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-01T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-01T00:00:00Z",
          data: null,
        },
        {
          id: "2",
          __cursor: "cursor_2",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-02T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-02T00:00:00Z",
          data: null,
        },
        {
          id: "1", // Duplicate
          __cursor: "cursor_1_dup",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-01T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-01T00:00:00Z",
          data: null,
        },
      ];

      const result = deduplicateItems(items);

      expect(result).toHaveLength(2);
      expect(result[0]!.id).toBe("1");
      expect(result[1]!.id).toBe("2");
      // Should keep the first occurrence
      expect(result[0]!.__cursor).toBe("cursor_1");
    });

    test("returns empty array for empty input", () => {
      const result = deduplicateItems([]);
      expect(result).toEqual([]);
    });

    test("returns single item unchanged", () => {
      const item: FeedItem = {
        id: "1",
        __cursor: "cursor_1",
        activities: [],
        actors: [],
        blocks: [],
        archived_at: null,
        inserted_at: "2023-01-01T00:00:00Z",
        read_at: null,
        seen_at: null,
        clicked_at: null,
        interacted_at: null,
        link_clicked_at: null,
        source: { key: "test", version_id: "v1", categories: [] },
        tenant: null,
        total_activities: 0,
        total_actors: 0,
        updated_at: "2023-01-01T00:00:00Z",
        data: null,
      };

      const result = deduplicateItems([item]);
      expect(result).toEqual([item]);
    });
  });

  describe("sortItems", () => {
    test("sorts items by inserted_at in descending order", () => {
      const items: FeedItem[] = [
        {
          id: "1",
          __cursor: "cursor_1",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-01T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-01T00:00:00Z",
          data: null,
        },
        {
          id: "2",
          __cursor: "cursor_2",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-03T00:00:00Z", // Latest
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-03T00:00:00Z",
          data: null,
        },
        {
          id: "3",
          __cursor: "cursor_3",
          activities: [],
          actors: [],
          blocks: [],
          archived_at: null,
          inserted_at: "2023-01-02T00:00:00Z",
          read_at: null,
          seen_at: null,
          clicked_at: null,
          interacted_at: null,
          link_clicked_at: null,
          source: { key: "test", version_id: "v1", categories: [] },
          tenant: null,
          total_activities: 0,
          total_actors: 0,
          updated_at: "2023-01-02T00:00:00Z",
          data: null,
        },
      ];

      const result = sortItems(items);

      expect(result).toHaveLength(3);
      expect(result[0]!.id).toBe("2"); // Latest first
      expect(result[1]!.id).toBe("3"); // Middle
      expect(result[2]!.id).toBe("1"); // Earliest last
    });

    test("handles empty array", () => {
      const result = sortItems([]);
      expect(result).toEqual([]);
    });
  });

  describe("mergeDateRangeParams", () => {
    test("returns options unchanged when no date range", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        tenant: "test_tenant",
      };

      const result = mergeDateRangeParams(options);

      expect(result).toEqual({
        archived: "exclude",
        tenant: "test_tenant",
      });
    });

    test("merges date range with inclusive=true", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        inserted_at_date_range: {
          start: "2023-01-01T00:00:00Z",
          end: "2023-01-31T23:59:59Z",
          inclusive: true,
        },
      };

      const result = mergeDateRangeParams(options);

      expect(result).toEqual({
        archived: "exclude",
        "inserted_at.gte": "2023-01-01T00:00:00Z",
        "inserted_at.lte": "2023-01-31T23:59:59Z",
      });
    });

    test("merges date range with inclusive=false", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        inserted_at_date_range: {
          start: "2023-01-01T00:00:00Z",
          end: "2023-01-31T23:59:59Z",
          inclusive: false,
        },
      };

      const result = mergeDateRangeParams(options);

      expect(result).toEqual({
        archived: "exclude",
        "inserted_at.gt": "2023-01-01T00:00:00Z",
        "inserted_at.lt": "2023-01-31T23:59:59Z",
      });
    });

    test("merges date range with inclusive undefined (defaults to false)", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        inserted_at_date_range: {
          start: "2023-01-01T00:00:00Z",
          end: "2023-01-31T23:59:59Z",
        },
      };

      const result = mergeDateRangeParams(options);

      expect(result).toEqual({
        archived: "exclude",
        "inserted_at.gt": "2023-01-01T00:00:00Z",
        "inserted_at.lt": "2023-01-31T23:59:59Z",
      });
    });

    test("merges date range with only start date", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        inserted_at_date_range: {
          start: "2023-01-01T00:00:00Z",
          inclusive: true,
        },
      };

      const result = mergeDateRangeParams(options);

      expect(result).toEqual({
        archived: "exclude",
        "inserted_at.gte": "2023-01-01T00:00:00Z",
      });
    });

    test("merges date range with only end date", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        inserted_at_date_range: {
          end: "2023-01-31T23:59:59Z",
          inclusive: true,
        },
      };

      const result = mergeDateRangeParams(options);

      expect(result).toEqual({
        archived: "exclude",
        "inserted_at.lte": "2023-01-31T23:59:59Z",
      });
    });
  });

  describe("getFormattedTriggerData", () => {
    test("returns undefined when no trigger_data", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
      };

      const result = getFormattedTriggerData(options);

      expect(result).toBeUndefined();
    });

    test("stringifies object trigger_data", () => {
      const triggerData: TriggerData = { user_id: "123", action: "like" };
      const options: FeedClientOptions = {
        archived: "exclude",
        trigger_data: triggerData,
      };

      const result = getFormattedTriggerData(options);

      expect(result).toBe(JSON.stringify(triggerData));
    });

    test("returns string trigger_data unchanged", () => {
      const triggerData: TriggerData = {
        json_string: '{"user_id":"123","action":"like"}',
      };
      const options: FeedClientOptions = {
        archived: "exclude",
        trigger_data: triggerData,
      };

      const result = getFormattedTriggerData(options);

      expect(result).toBe(JSON.stringify(triggerData));
    });

    test("handles undefined trigger_data", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        trigger_data: undefined,
      };

      const result = getFormattedTriggerData(options);

      expect(result).toBeUndefined();
    });

    test("handles valid flat object trigger_data", () => {
      const triggerData: TriggerData = {
        string_key: "value",
        number_key: 42,
        boolean_key: true,
        null_key: null,
      };
      const options: FeedClientOptions = {
        archived: "exclude",
        trigger_data: triggerData,
      };

      const result = getFormattedTriggerData(options);

      expect(result).toBe(JSON.stringify(triggerData));
    });

    test("returns stringified object for object trigger data", () => {
      const options = {
        trigger_data: { userId: "123", action: "click" },
      };

      const result = getFormattedTriggerData(options);
      expect(result).toBe('{"userId":"123","action":"click"}');
    });

    test("returns string as-is for string trigger data", () => {
      const options = {
        trigger_data: '{"userId":"456","action":"view"}',
      } as unknown as FeedClientOptions;

      const result = getFormattedTriggerData(options);
      expect(result).toBe('{"userId":"456","action":"view"}');
    });

    test("returns undefined for undefined trigger data", () => {
      const options = {};

      const result = getFormattedTriggerData(options);
      expect(result).toBeUndefined();
    });

    test("stringifies null trigger data (since typeof null === 'object')", () => {
      const options = {
        trigger_data: null,
      } as unknown as FeedClientOptions;

      const result = getFormattedTriggerData(options);
      // In JavaScript, typeof null === "object", so null gets stringified
      expect(result).toBe("null");
    });

    test("returns undefined for other primitive types", () => {
      const testCases = [
        { trigger_data: 123 } as unknown as FeedClientOptions,
        { trigger_data: true } as unknown as FeedClientOptions,
        { trigger_data: Symbol("test") } as unknown as FeedClientOptions,
      ];

      testCases.forEach((options) => {
        const result = getFormattedTriggerData(options);
        expect(result).toBeUndefined();
      });
    });
  });

  describe("getFormattedExclude", () => {
    test("returns undefined when no exclude option", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
      };

      const result = getFormattedExclude(options);

      expect(result).toBeUndefined();
    });

    test("returns undefined when exclude is undefined", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        exclude: undefined,
      };

      const result = getFormattedExclude(options);

      expect(result).toBeUndefined();
    });

    test("returns undefined when exclude is empty array", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        exclude: [],
      };

      const result = getFormattedExclude(options);

      expect(result).toBeUndefined();
    });

    test("returns single field as-is", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        exclude: ["entries.archived_at"],
      };

      const result = getFormattedExclude(options);

      expect(result).toBe("entries.archived_at");
    });

    test("joins multiple fields with commas", () => {
      const options: FeedClientOptions = {
        archived: "exclude",
        exclude: ["entries.archived_at", "meta.total_count", "entries.data"],
      };

      const result = getFormattedExclude(options);

      expect(result).toBe("entries.archived_at,meta.total_count,entries.data");
    });

    test("returns undefined for empty options object", () => {
      const options: FeedClientOptions = {};

      const result = getFormattedExclude(options);

      expect(result).toBeUndefined();
    });
  });
});
