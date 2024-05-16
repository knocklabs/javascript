import { useMemo, useRef } from "react";
import shallow from "zustand/shallow";

export default function useStableOptions<T>(options: T): T {
  const optionsRef = useRef<T>();

  return useMemo(() => {
    const currentOptions = optionsRef.current || {};

    if (shallow(options, currentOptions)) {
      return currentOptions as T;
    }

    optionsRef.current = options;
    return options;
  }, [options]);
}
