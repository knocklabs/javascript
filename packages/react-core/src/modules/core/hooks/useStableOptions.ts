import deepEqual from "deep-equal";
import { useMemo, useRef } from "react";

export default function useStableOptions<T>(options: T): T {
  const optionsRef = useRef<T>();

  return useMemo(() => {
    const currentOptions = optionsRef.current;

    const objectsHaventChanged = deepEqual(options, currentOptions, {
      // use strict equality (===) to compare leaf nodes
      strict: true,
    });

    if (currentOptions && objectsHaventChanged) {
      return currentOptions;
    }

    optionsRef.current = options;
    return options;
  }, [options]);
}
