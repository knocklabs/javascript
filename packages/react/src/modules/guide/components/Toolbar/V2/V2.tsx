import { useGuideContext } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Icon } from "@telegraph/icon";
import { Box, Stack } from "@telegraph/layout";
import { SegmentedControl } from "@telegraph/segmented-control";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  LogOut,
  Minimize2,
  SlidersHorizontal,
} from "lucide-react";
import React from "react";

import { KnockButton } from "../KnockButton";
import { TOOLBAR_Z_INDEX } from "../shared";
import "../styles.css";

import { FocusChin } from "./FocusChin";
import { GuideContextDetails } from "./GuideContextDetails";
import { GuideRow } from "./GuideRow";
import { DisplayOption, clearRunConfigLS, getRunConfig } from "./helpers";
import { useDraggable } from "./useDraggable";
import {
  InspectionResultOk,
  useInspectGuideClientStore,
} from "./useInspectGuideClientStore";

const HOTKEY_TOGGLE_IS_COLLAPSED = "Control";

const TOOLBAR_WIDTH = "540px";

const Kbd = ({ children }: { children: React.ReactNode }) => {
  return (
    <kbd
      style={{
        display: "inline-block",
        padding: "1px 4px",
        borderRadius: "var(--tgph-rounded-2)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.15)",
      }}
    >
      {children}
    </kbd>
  );
};

const filterGuides = (
  guides: InspectionResultOk["guides"],
  displayOption: DisplayOption,
) => {
  return guides.filter((guide) => {
    const { isEligible, isQualified } = guide.annotation;
    const isDisplayable = isEligible && isQualified;

    if (displayOption === "only-displayable" && !isDisplayable) {
      return false;
    }
    if (displayOption === "only-eligible" && !isEligible) {
      return false;
    }
    if (displayOption === "only-active" && !guide.annotation.active.status) {
      return false;
    }
    return true;
  });
};

export const V2 = () => {
  const { client } = useGuideContext();

  const [displayOption, setDisplayOption] =
    React.useState<DisplayOption>("only-active");
  const [runConfig, setRunConfig] = React.useState(() => getRunConfig());
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isContextPanelOpen, setIsContextPanelOpen] = React.useState(false);

  const [expandedGuideRowKey, setExpandedGuideRowKey] = React.useState<
    string | undefined
  >();

  React.useEffect(() => {
    setExpandedGuideRowKey(undefined);
  }, [displayOption]);

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
      if (e.key === HOTKEY_TOGGLE_IS_COLLAPSED && !e.repeat) {
        ctrlUsedInCombo = false;
      } else if (e.ctrlKey) {
        ctrlUsedInCombo = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === HOTKEY_TOGGLE_IS_COLLAPSED && !ctrlUsedInCombo) {
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
  const guideListRef = React.useRef<HTMLDivElement>(null);
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

  const guides =
    result.status === "ok" ? filterGuides(result.guides, displayOption) : [];

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
        <Tooltip
          side="left"
          delayDuration={500}
          label={
            <Text as="span" size="1">
              Guide Toolbar <Kbd>ctrl</Kbd>
            </Text>
          }
        >
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
        </Tooltip>
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

                    const debugSettings = client.store.state.debug;

                    const focusedGuideKeys = Object.keys(
                      debugSettings?.focusedGuideKeys || {},
                    );

                    // Exit out of focus if the currently focused guide is not
                    // part of the selected list filter.
                    if (result.status === "ok" && focusedGuideKeys.length > 0) {
                      const currFocusedGuide = filterGuides(
                        result.guides,
                        val,
                      ).find((g) => g.key === focusedGuideKeys[0]);

                      if (!currFocusedGuide) {
                        client.setDebug({
                          ...debugSettings,
                          focusedGuideKeys: {},
                        });
                      }
                    }

                    setDisplayOption(val);
                  }}
                >
                  <SegmentedControl.Option
                    value="all-guides"
                    style={{ width: "54px" }}
                  >
                    All
                  </SegmentedControl.Option>
                  <SegmentedControl.Option
                    value="only-active"
                    style={{ width: "54px" }}
                  >
                    Active
                  </SegmentedControl.Option>
                  <SegmentedControl.Option
                    value="only-eligible"
                    style={{ width: "54px" }}
                  >
                    Eligible
                  </SegmentedControl.Option>
                  {/* Note: `only-displayable` is not available for now */}
                </SegmentedControl.Root>

                <Tooltip label="Settings & target params">
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
          <Box
            tgphRef={guideListRef}
            p="1"
            overflow="auto"
            style={{ maxHeight: "calc(80vh - 96px)" }}
          >
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
            ) : guides.length === 0 ? (
              <Box px="2" pb="1" style={{ lineHeight: "1.2" }}>
                <Text as="span" size="1" weight="medium" color="default">
                  No guides match the current filter.
                </Text>
              </Box>
            ) : (
              guides.map((guide) => (
                <GuideRow
                  key={guide.key}
                  guide={guide}
                  orderIndex={guide.orderIndex}
                  isExpanded={guide.key === expandedGuideRowKey}
                  onClick={() => {
                    setExpandedGuideRowKey((k) =>
                      k && k === guide.key ? undefined : guide.key,
                    );
                  }}
                />
              ))
            )}
          </Box>

          {/* Focus chin with dedicated controls */}
          <FocusChin guides={guides} guideListRef={guideListRef} />
        </Stack>
      )}
    </Box>
  );
};
