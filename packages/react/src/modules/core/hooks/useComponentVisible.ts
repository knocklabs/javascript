import { RefObject, useCallback, useEffect } from "react";

export type UseComponentVisibleOptions = {
  closeOnClickOutside: boolean;
};

export default function useComponentVisible<
  T extends HTMLElement = HTMLElement,
>(
  ref: RefObject<T>,
  isVisible: boolean,
  onClose: (event: Event) => void,
  options: UseComponentVisibleOptions,
) {
  const handleKeydown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose(event);
      }
    },
    [onClose],
  );

  const handleClickOutside = useCallback(
    (event: Event) => {
      const target = event.target as Node;

      if (!target || !target.isConnected) {
        return;
      }

      if (
        options.closeOnClickOutside &&
        ref.current &&
        ref.current.contains(target)
      ) {
        onClose(event);
      }
    },
    [ref, options.closeOnClickOutside, onClose],
  );

  useEffect(() => {
    if (isVisible) {
      window.addEventListener("keydown", handleKeydown);
      window.addEventListener("click", handleClickOutside);
    }

    return () => {
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("click", handleClickOutside);
    };
  }, [isVisible, handleKeydown, handleClickOutside]);
}
