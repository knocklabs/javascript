import debounce from "lodash.debounce";
import { RefObject, useCallback, useEffect, useMemo } from "react";

type OnBottomScrollOptions = {
  ref: RefObject<HTMLDivElement | null>;
  callback: () => void;
  offset?: number;
};

const noop = () => {};

function useOnBottomScroll(options: OnBottomScrollOptions) {
  const callback = options.callback ?? noop;
  const ref = options.ref;
  const offset = options.offset ?? 0;

  const debouncedCallback = useMemo(() => debounce(callback, 200), [callback]);

  const handleOnScroll = useCallback(() => {
    if (ref.current) {
      const scrollNode = ref.current;
      const scrollContainerBottomPosition = Math.round(
        scrollNode.scrollTop + scrollNode.clientHeight,
      );
      const scrollPosition = Math.round(scrollNode.scrollHeight - offset);

      if (scrollPosition <= scrollContainerBottomPosition) {
        debouncedCallback();
      }
    }
    // TODO: Check if we can remove this disable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCallback]);

  useEffect(() => {
    let element: HTMLElement | undefined;
    if (ref.current) {
      element = ref.current;
      ref.current.addEventListener("scroll", handleOnScroll);
    }

    return () => {
      if (element) {
        element.removeEventListener("scroll", handleOnScroll);
      }
    };
    // TODO: Check if we can remove this disable
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleOnScroll]);
}

export default useOnBottomScroll;
