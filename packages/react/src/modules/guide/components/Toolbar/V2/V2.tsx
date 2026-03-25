import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Icon } from "@telegraph/icon";
import { Box, Stack } from "@telegraph/layout";
import { SegmentedControl } from "@telegraph/segmented-control";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import {
  Box as BoxIcon,
  ChevronDown,
  ChevronRight,
  Gauge,
  GripVertical,
  LogOut,
  Minimize2,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";

import { KnockButton } from "../KnockButton";
import { TOOLBAR_Z_INDEX } from "../shared";
import "../styles.css";

import { GuideContextDetails } from "./GuideContextDetails";
import { GuideRow } from "./GuideRow";
import { clearRunConfigLS, getRunConfig } from "./helpers";
import { useDraggable } from "./useDraggable";
import {
  InspectionResultOk,
  useInspectGuideClientStore,
} from "./useInspectGuideClientStore";

const TOOLBAR_WIDTH = "540px";

type DisplayOption = "all-guides" | "only-eligible" | "only-displayable";

const GuidesList = ({
  guides,
  displayOption,
}: {
  guides: InspectionResultOk["guides"];
  displayOption: DisplayOption;
}) => {
  const [expandedGuideRowKey, setExpandedGuideRowKey] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    setExpandedGuideRowKey(undefined);
  }, [displayOption]);

  return guides.map((guide, idx) => {
    const { isEligible, isQualified } = guide.annotation;
    const isDisplayable = isEligible && isQualified;

    if (displayOption === "only-displayable" && !isDisplayable) {
      return null;
    }
    if (displayOption === "only-eligible" && !isEligible) {
      return null;
    }
    return (
      <GuideRow
        key={guide.key}
        guide={guide}
        orderIndex={idx}
        isExpanded={guide.key === expandedGuideRowKey}
        onClick={() => {
          setExpandedGuideRowKey((k) =>
            k && k === guide.key ? undefined : guide.key,
          );
        }}
      />
    );
  });
};

export const V2 = () => {
  const { client } = useGuideContext();

  const [displayOption, setDisplayOption] =
    React.useState<DisplayOption>("only-eligible");
  const [runConfig, setRunConfig] = React.useState(() => getRunConfig());
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = React.useState(false);

  const { debugSettings } = useStore(client.store, (state) => ({
    debugSettings: state.debug || {},
  }));

  React.useEffect(() => {
    const { isVisible = false, focusedGuideKeys = {} } = runConfig || {};
    const isDebugging = client.store.state.debug?.debugging;
    if (isVisible && !isDebugging) {
      client.setDebug({ focusedGuideKeys });

      // If focused, switch to all guides so you can see in the list.
      if (Object.keys(focusedGuideKeys).length > 0) {
        setDisplayOption("all-guides");
      }
    }

    return () => {
      client.unsetDebug();
    };
  }, [runConfig, client, setDisplayOption]);

  // Toggle collapsed state when Ctrl is pressed and released alone
  // (without combining with another key), similar to Vercel's toolbar.
  React.useEffect(() => {
    let ctrlUsedInCombo = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") {
        ctrlUsedInCombo = false;
      } else if (e.ctrlKey) {
        ctrlUsedInCombo = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control" && !ctrlUsedInCombo) {
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const { position, isDragging, handlePointerDown, hasDraggedRef } =
    useDraggable({
      elementRef: containerRef,
      reclampDeps: [isCollapsed],
      initialPosition: { top: 16, right: 16 },
    });

  const result = useInspectGuideClientStore(runConfig);
  if (!result || !runConfig?.isVisible) {
    return null;
  }

  return (
    <Box
      tgphRef={containerRef}
      position="fixed"
      style={{
        top: position.top + "px",
        right: position.right + "px",
        zIndex: TOOLBAR_Z_INDEX,
      }}
    >
      {isCollapsed ? (
        <Stack
          border="px"
          rounded="4"
          align="center"
          justify="center"
          w="10"
          h="10"
          onPointerDown={handlePointerDown}
          backgroundColor="surface-1"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
            touchAction: "none",
            userSelect: "none",
            animation: "toolbar-collapse-fade-in 150ms ease-out",
          }}
        >
          <Box
            style={{
              transform: "scale(0.7)",
              transformOrigin: "center center",
            }}
          >
            <KnockButton
              onClick={() => {
                if (!hasDraggedRef.current) {
                  setIsCollapsed(false);
                }
              }}
              positioned={false}
            />
          </Box>
        </Stack>
      ) : (
        <Stack
          direction="column"
          backgroundColor="surface-1"
          rounded="4"
          border="px"
          overflow="hidden"
          style={{
            width: TOOLBAR_WIDTH,
            boxShadow: "0 8px 32px var(--tgph-gray-5)",
            animation: "toolbar-expand-fade-in 150ms ease-out",
          }}
        >
          {/* Header — also acts as drag handle area */}
          <Stack
            w="full"
            p="2"
            justify="space-between"
            direction="row"
            align="center"
            gap="2"
            borderBottom="px"
            onPointerDown={handlePointerDown}
            style={{
              boxSizing: "border-box",
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
              userSelect: "none",
            }}
          >
            {/* Left: drag icon + segmented control + settings */}
            <Stack align="center" gap="1_5" style={{ minWidth: 0, flex: 1 }}>
              <Stack
                display="inline-flex"
                align="center"
                style={{
                  cursor: isDragging ? "grabbing" : "grab",
                  touchAction: "none",
                  userSelect: "none",
                }}
                onPointerDown={(e: React.PointerEvent) => {
                  // Already handled by parent, prevent double-fire
                  e.stopPropagation();
                  handlePointerDown(e);
                }}
              >
                <Icon color="gray" size="1" icon={GripVertical} aria-hidden />
              </Stack>
              <Stack
                align="center"
                gap="1_5"
                onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
              >
                <SegmentedControl.Root
                  size="1"
                  type="single"
                  value={displayOption}
                  onValueChange={(val: DisplayOption) => {
                    if (!val) return;
                    setDisplayOption(val);
                  }}
                >
                  <SegmentedControl.Option value="all-guides">
                    All guides
                  </SegmentedControl.Option>
                  <SegmentedControl.Option value="only-eligible">
                    Eligible
                  </SegmentedControl.Option>
                  <SegmentedControl.Option value="only-displayable">
                    On this page
                  </SegmentedControl.Option>
                </SegmentedControl.Root>

                <Tooltip label="Sandbox: Contain engagement actions to client side only">
                  <Button
                    size="1"
                    variant={
                      debugSettings.skipEngagementTracking ? "outline" : "ghost"
                    }
                    color={
                      debugSettings.skipEngagementTracking ? "blue" : "gray"
                    }
                    icon={{ icon: BoxIcon, alt: "Sandbox mode" }}
                    onClick={() => {
                      client.setDebug({
                        ...debugSettings,
                        skipEngagementTracking:
                          !debugSettings.skipEngagementTracking,
                      });
                    }}
                  />
                </Tooltip>

                <Tooltip label="Ignore throttle: Show next guide immediately">
                  <Button
                    size="1"
                    variant={
                      debugSettings.ignoreDisplayInterval ? "outline" : "ghost"
                    }
                    color={
                      debugSettings.ignoreDisplayInterval ? "blue" : "gray"
                    }
                    icon={{ icon: Gauge, alt: "Ignore throttle" }}
                    onClick={() => {
                      client.setDebug({
                        ...debugSettings,
                        ignoreDisplayInterval:
                          !debugSettings.ignoreDisplayInterval,
                      });
                    }}
                  />
                </Tooltip>

                <Tooltip label="Inspect target params">
                  <Button
                    size="1"
                    variant={isContextPanelOpen ? "outline" : "ghost"}
                    color={isContextPanelOpen ? "blue" : "gray"}
                    leadingIcon={{
                      icon: SlidersHorizontal,
                      alt: "Inspect target params",
                    }}
                    trailingIcon={
                      isContextPanelOpen
                        ? { icon: ChevronDown, alt: "Hide context data" }
                        : { icon: ChevronRight, alt: "Show context data" }
                    }
                    onClick={() => setIsContextPanelOpen((v) => !v)}
                  />
                </Tooltip>
              </Stack>
            </Stack>

            {/* Right: exit + minimize buttons */}
            <Stack
              align="center"
              gap="1_5"
              style={{ flexShrink: 0 }}
              onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
            >
              <Stack align="center" gap="1_5">
                <Button
                  size="1"
                  variant="outline"
                  leadingIcon={{ icon: LogOut, alt: "Exit" }}
                  onClick={() => {
                    setRunConfig((curr) => ({ ...curr, isVisible: false }));
                    clearRunConfigLS();
                    client.unsetDebug();
                  }}
                >
                  Exit
                </Button>
                <Tooltip label="Minimize toolbar">
                  <Button
                    size="1"
                    variant="outline"
                    leadingIcon={{ icon: Minimize2, alt: "Minimize" }}
                    onClick={() => setIsCollapsed(true)}
                  />
                </Tooltip>
              </Stack>
            </Stack>
          </Stack>

          {/* Collapsible panel to show context data */}
          {isContextPanelOpen && (
            <Box borderBottom="px">
              <GuideContextDetails />
            </Box>
          )}

          {/* Guide list content area */}
          <Box p="1" overflow="auto" style={{ maxHeight: "calc(80vh - 96px)" }}>
            {result.status === "error" ? (
              <Box px="2" pb="1" style={{ lineHeight: "1.2" }}>
                <Text
                  as="span"
                  size="1"
                  weight="medium"
                  color={
                    result.error === "no_guides_fetched" ? "default" : "red"
                  }
                >
                  {result.message}
                </Text>
              </Box>
            ) : (
              <GuidesList
                guides={result.guides}
                displayOption={displayOption}
              />
            )}
          </Box>
        </Stack>
      )}
    </Box>
  );
};
