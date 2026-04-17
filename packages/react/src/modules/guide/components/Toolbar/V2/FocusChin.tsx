import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";

import { GUIDE_ROW_DATA_SELECTOR } from "./GuideRow";
import { Kbd } from "./Kbd";
import { sharedTooltipProps } from "./helpers";
import { InspectionResultOk } from "./useInspectGuideClientStore";

// Extra scroll overshoot so the focused guide plus ~1-2 neighbors are visible,
// reducing how often consecutive next/prev clicks trigger a scroll.
const SCROLL_OVERSHOOT = 60;

const FOCUS_PREV_HOTKEY = ",";
const FOCUS_NEXT_HOTKEY = "/";

const maybeScrollGuideIntoView = (container: HTMLElement, guideKey: string) => {
  requestAnimationFrame(() => {
    const el = container.querySelector(
      `[${GUIDE_ROW_DATA_SELECTOR}="${CSS.escape(guideKey)}"]`,
    );
    if (!el || !(el instanceof HTMLElement)) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    if (elRect.top < containerRect.top) {
      container.scrollTo({
        top:
          container.scrollTop -
          (containerRect.top - elRect.top) -
          SCROLL_OVERSHOOT,
        behavior: "smooth",
      });
    } else if (elRect.bottom > containerRect.bottom) {
      container.scrollTo({
        top:
          container.scrollTop +
          (elRect.bottom - containerRect.bottom) +
          SCROLL_OVERSHOOT,
        behavior: "smooth",
      });
    }
  });
};

type FocusNav = {
  guides: InspectionResultOk["guides"];
  currentKey: string | undefined;
  focusGuide: (guideKey: string) => void;
};

const focusPrev = ({ guides, currentKey, focusGuide }: FocusNav) => {
  const selectableGuides = guides.filter(
    (g) => !!g.annotation.selectable.status,
  );
  if (selectableGuides.length === 0) return;

  if (!currentKey) {
    focusGuide(selectableGuides[selectableGuides.length - 1]!.key);
    return;
  }

  const currIndex = selectableGuides.findIndex((g) => g.key === currentKey);
  const prevGuide =
    currIndex <= 0 ? undefined : selectableGuides[currIndex - 1];
  if (!prevGuide) return;
  focusGuide(prevGuide.key);
};

const focusNext = ({ guides, currentKey, focusGuide }: FocusNav) => {
  const selectableGuides = guides.filter(
    (g) => !!g.annotation.selectable.status,
  );
  if (selectableGuides.length === 0) return;

  if (!currentKey) {
    focusGuide(selectableGuides[0]!.key);
    return;
  }

  const currIndex = selectableGuides.findIndex((g) => g.key === currentKey);
  const nextGuide =
    currIndex < 0 || currIndex + 1 > selectableGuides.length - 1
      ? undefined
      : selectableGuides[currIndex + 1];
  if (!nextGuide) return;
  focusGuide(nextGuide.key);
};

type Props = {
  guides: InspectionResultOk["guides"];
  guideListRef: React.RefObject<HTMLDivElement | null>;
};

export const FocusChin = ({ guides, guideListRef }: Props) => {
  const { client } = useGuideContext();
  const { debugSettings } = useStore(client.store, (state) => ({
    debugSettings: state.debug,
  }));

  const focusedKeys = Object.keys(debugSettings?.focusedGuideKeys || {});
  const isFocused = focusedKeys.length > 0;
  const currentKey = focusedKeys[0];

  const focusGuide = React.useCallback(
    (guideKey: string) => {
      client.setDebug({
        ...client.store.state.debug,
        focusedGuideKeys: { [guideKey]: true },
      });
      if (guideListRef.current) {
        maybeScrollGuideIntoView(guideListRef.current, guideKey);
      }
    },
    [client, guideListRef],
  );

  // Latest-ref so the window keydown listener below can attach once and always
  // read the current guides / focused key without needing to re-subscribe.
  const latestRef = React.useRef<FocusNav>({ guides, currentKey, focusGuide });
  React.useEffect(() => {
    latestRef.current = { guides, currentKey, focusGuide };
  });

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey || e.repeat) return;
      if (e.key === FOCUS_PREV_HOTKEY) {
        e.preventDefault();
        focusPrev(latestRef.current);
      } else if (e.key === FOCUS_NEXT_HOTKEY) {
        e.preventDefault();
        focusNext(latestRef.current);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isFocused) {
    return null;
  }

  return (
    <Box
      borderTop="px"
      px="3"
      py="1"
      overflow="hidden"
      backgroundColor="blue-2"
    >
      <Stack align="center" justify="space-between" gap="4">
        <Text
          as="span"
          size="1"
          weight="medium"
          color="blue"
          style={{
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            minWidth: 0,
          }}
        >
          Focus mode: {currentKey}
        </Text>
        <Stack align="center" gap="1" style={{ flexShrink: 0 }}>
          <Tooltip
            label={
              <Text as="span" size="1">
                Focus previous guide
                <Stack display="inline-block" ml="3">
                  <Kbd>ctrl</Kbd> + <Kbd>,</Kbd>
                </Stack>
              </Text>
            }
            {...sharedTooltipProps}
          >
            <Button
              size="0"
              variant="ghost"
              color="blue"
              leadingIcon={{ icon: ChevronLeft, alt: "Previous guide" }}
              onClick={() => focusPrev(latestRef.current)}
            />
          </Tooltip>
          <Tooltip
            label={
              <Text as="span" size="1">
                Focus next guide
                <Stack display="inline-block" ml="3">
                  <Kbd>ctrl</Kbd> + <Kbd>/</Kbd>
                </Stack>
              </Text>
            }
            {...sharedTooltipProps}
          >
            <Button
              size="0"
              variant="ghost"
              color="blue"
              leadingIcon={{ icon: ChevronRight, alt: "Next guide" }}
              onClick={() => focusNext(latestRef.current)}
            />
          </Tooltip>
          <Tooltip label="Exit focus mode" {...sharedTooltipProps}>
            <Button
              size="0"
              variant="ghost"
              color="blue"
              leadingIcon={{ icon: X, alt: "Clear focus" }}
              onClick={() => {
                client.setDebug({ ...debugSettings, focusedGuideKeys: {} });
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>
    </Box>
  );
};
