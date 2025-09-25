import {
  KnockGuide,
  KnockGuideFilterParams,
  KnockGuideStep,
} from "@knocklabs/client";
import { useStore } from "@tanstack/react-store";

import { UseGuideContextReturn, useGuideContext } from "./useGuideContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

/**
 * Return type for the useGuide hook.
 * 
 * @template C - The custom data type for guide content
 */
export interface UseGuideReturn<C = Any> extends UseGuideContextReturn {
  /** The guide object matching the provided filters, or undefined if no guide matches */
  guide: KnockGuide<C> | undefined;
  /** The current step of the guide, or undefined if no guide or no current step */
  step: KnockGuideStep<C> | undefined;
}

/**
 * Hook for retrieving and managing a specific guide based on filters.
 * 
 * This hook allows you to access a specific guide from the Knock system by providing
 * filter criteria such as key or type. It returns the guide object along with its
 * current step and provides access to the guide context.
 * 
 * @template C - The custom data type for guide content
 * @param filters - Filter parameters to identify the guide
 * @param filters.key - Optional unique key to identify a specific guide
 * @param filters.type - Optional type to filter guides by their type
 * 
 * @returns An object containing:
 * - `guide`: The matched guide object or undefined if no match
 * - `step`: The current step of the guide or undefined
 * - `client`: The Knock client instance from context
 * - `colorMode`: The current color mode from context
 * 
 * @throws {Error} When neither key nor type filters are provided
 * 
 * @example
 * ```typescript
 * // Get a guide by key
 * const { guide, step, client } = useGuide({ key: 'onboarding-guide' });
 * 
 * if (guide) {
 *   console.log('Guide title:', guide.title);
 *   if (step) {
 *     console.log('Current step:', step.title);
 *   }
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Get a guide by type
 * const { guide, step } = useGuide({ type: 'tutorial' });
 * 
 * // Use with custom content type
 * interface CustomGuideData {
 *   category: string;
 *   difficulty: 'easy' | 'medium' | 'hard';
 * }
 * 
 * const { guide } = useGuide<CustomGuideData>({ key: 'advanced-tutorial' });
 * ```
 */
export const useGuide = <C = Any>(
  filters: KnockGuideFilterParams,
): UseGuideReturn<C> => {
  const context = useGuideContext();

  if (!filters.key && !filters.type) {
    throw new Error(
      "useGuide must be given at least one filter: { key?: string; type?: string; }",
    );
  }

  const { client, colorMode } = context;

  const guide = useStore(client.store, (state) =>
    client.selectGuide<C>(state, filters),
  );

  const step = guide && guide.getStep();

  return { client, colorMode, guide, step };
};
