import { KnockGuide, KnockGuideFilterParams } from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

/**
 * Return type for the useGuides hook.
 * 
 * @template C - The custom data type for guide content
 */
export interface UseGuidesReturn<C = Any> extends UseGuideContextReturn {
  /** Array of guides matching the provided filters */
  guides: KnockGuide<C>[];
}

/**
 * Hook for retrieving and managing multiple guides based on type filters.
 * 
 * This hook allows you to access multiple guides from the Knock system by providing
 * a type filter. It returns an array of guide objects that match the specified type
 * along with access to the guide context.
 * 
 * @template C - The custom data type for guide content
 * @param filters - Filter parameters to identify guides
 * @param filters.type - Required type to filter guides by their type
 * 
 * @returns An object containing:
 * - `guides`: Array of guides matching the filter
 * - `client`: The Knock client instance from context
 * - `colorMode`: The current color mode from context
 * 
 * @example
 * ```typescript
 * // Get all tutorial guides
 * const { guides, client } = useGuides({ type: 'tutorial' });
 * 
 * console.log(`Found ${guides.length} tutorial guides`);
 * guides.forEach(guide => {
 *   console.log('Guide:', guide.title);
 * });
 * ```
 * 
 * @example
 * ```typescript
 * // Use with custom content type
 * interface TutorialData {
 *   difficulty: 'beginner' | 'intermediate' | 'advanced';
 *   estimatedTime: number;
 * }
 * 
 * const { guides } = useGuides<TutorialData>({ type: 'tutorial' });
 * 
 * // Filter by difficulty
 * const beginnerGuides = guides.filter(guide => 
 *   guide.data?.difficulty === 'beginner'
 * );
 * ```
 */
export const useGuides = <C = Any>(
  filters: Pick<KnockGuideFilterParams, "type">,
): UseGuidesReturn<C> => {
  const context = useGuideContext();
  const { client, colorMode } = context;

  const guides = useStore(client.store, (state) =>
    client.selectGuides<C>(state, filters),
  );

  return { client, colorMode, guides };
};
