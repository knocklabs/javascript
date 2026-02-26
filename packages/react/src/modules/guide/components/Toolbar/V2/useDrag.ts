import React from "react";

type Position = { top: number; right: number };

type UseDragOptions = {
  elementRef: React.RefObject<HTMLElement | null>;
  initialPosition?: Position;
  reclampDeps?: React.DependencyList;
  /** Extra space to reserve beyond the element's right edge (px). */
  rightPadding?: number;
};

type UseDragReturn = {
  position: Position;
  isDragging: boolean;
  handlePointerDown: (e: React.PointerEvent) => void;
};

const DEFAULT_POSITION: Position = { top: 16, right: 16 };

/**
 * @param rightPadding Extra space to reserve on the right edge (e.g. for a
 *   drag handle that protrudes beyond the element). The element's left edge
 *   is clamped so that `elementWidth + rightPadding` stays within the viewport.
 */
export function clampPosition(
  pos: Position,
  elementWidth: number,
  elementHeight: number,
  rightPadding = 0,
): Position {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const totalWidth = elementWidth + rightPadding;
  const left = viewportWidth - pos.right - elementWidth;
  const clampedLeft = Math.max(0, Math.min(left, viewportWidth - totalWidth));
  const clampedTop = Math.max(
    0,
    Math.min(pos.top, viewportHeight - elementHeight),
  );
  const clampedRight = viewportWidth - clampedLeft - elementWidth;

  return { top: clampedTop, right: clampedRight };
}

export function useDrag({
  elementRef,
  initialPosition = DEFAULT_POSITION,
  reclampDeps = [],
  rightPadding = 0,
}: UseDragOptions): UseDragReturn {
  const [position, setPosition] = React.useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = React.useState(false);

  const positionRef = React.useRef(position);
  positionRef.current = position;

  const startPointerRef = React.useRef({ x: 0, y: 0 });
  const startPositionRef = React.useRef<Position>({ top: 0, right: 0 });
  const rafIdRef = React.useRef<number | null>(null);
  const isDraggingRef = React.useRef(false);

  const reclamp = React.useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPosition((prev) =>
      clampPosition(prev, rect.width, rect.height, rightPadding),
    );
  }, [elementRef, rightPadding]);

  // Stable pointerdown handler
  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      startPointerRef.current = { x: e.clientX, y: e.clientY };
      startPositionRef.current = { ...positionRef.current };
      isDraggingRef.current = true;
      setIsDragging(true);

      const onPointerMove = (moveEvent: PointerEvent) => {
        if (!isDraggingRef.current) return;

        if (rafIdRef.current !== null) return;

        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          if (!isDraggingRef.current) return;

          const dx = moveEvent.clientX - startPointerRef.current.x;
          const dy = moveEvent.clientY - startPointerRef.current.y;

          const newPos: Position = {
            top: startPositionRef.current.top + dy,
            right: startPositionRef.current.right - dx,
          };

          const el = elementRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const clamped = clampPosition(
            newPos,
            rect.width,
            rect.height,
            rightPadding,
          );
          setPosition(clamped);
        });
      };

      const onPointerUp = () => {
        isDraggingRef.current = false;
        setIsDragging(false);
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        document.removeEventListener("pointermove", onPointerMove);
        document.removeEventListener("pointerup", onPointerUp);
      };

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", onPointerUp);
    },
    [elementRef, rightPadding],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      isDraggingRef.current = false;
    };
  }, []);

  // Re-clamp on window resize
  React.useEffect(() => {
    const onResize = () => reclamp();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [reclamp]);

  // Re-clamp when deps change (e.g. collapse toggle)
  React.useEffect(() => {
    const id = requestAnimationFrame(() => reclamp());
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, reclampDeps);

  return { position, isDragging, handlePointerDown };
}
