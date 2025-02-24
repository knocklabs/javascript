import { useMemo, useRef } from "react";
import deepEqual from "deep-equal";

export default function useStableOptions<T>(options: T): T {
  const optionsRef = useRef<T>();

  return useMemo(() => {
    const currentOptions = optionsRef.current;

    const objectsHaventChanged = deepEqual(options, currentOptions);

    if (currentOptions && objectsHaventChanged) {
      return currentOptions;
    }

    optionsRef.current = options;
    return options;
  }, [options]);
}
