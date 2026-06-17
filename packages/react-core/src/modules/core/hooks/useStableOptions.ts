import { useMemo, useRef } from "react";

import { deepEqual } from "../deepEqual";

export default function useStableOptions<T>(options: T): T {
  const optionsRef = useRef<T>(undefined);

  return useMemo(() => {
    const currentOptions = optionsRef.current;

    if (currentOptions && deepEqual(options, currentOptions)) {
      return currentOptions;
    }

    optionsRef.current = options;
    return options;
  }, [options]);
}
