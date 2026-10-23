type DebouncedFunction<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
};

/**
 * Minimal trailing-edge debounce, replacing `lodash.debounce` for our single
 * use case (no `leading`/`maxWait` options). Invokes `func` once `wait`
 * milliseconds have elapsed since the last call.
 */
export const debounce = <TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait = 0,
): DebouncedFunction<TArgs> => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: TArgs) => {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      func(...args);
    }, wait);
  };

  debounced.cancel = () => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};
