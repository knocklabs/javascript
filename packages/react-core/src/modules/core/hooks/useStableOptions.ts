import fastDeepEqual from "fast-deep-equal";
import { useMemo, useRef } from "react";

export default function useStableOptions<T>(options: T): T {
  const optionsRef = useRef<T>(undefined);

  return useMemo(() => {
    const currentOptions = optionsRef.current;

    if (currentOptions && fastDeepEqual(options, currentOptions)) {
      return currentOptions;
    }

    optionsRef.current = options;
    return options;
  }, [options]);
}
