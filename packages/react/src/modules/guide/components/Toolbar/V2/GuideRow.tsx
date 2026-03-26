import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Icon } from "@telegraph/icon";
import { Box, Stack } from "@telegraph/layout";
import { Tag } from "@telegraph/tag";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import { Gauge } from "lucide-react";
import * as React from "react";

import {
  StatusColor,
  GuideAnnotatedStatusDot as StatusDot,
} from "./GuideAnnotatedStatusDot";
import { GuideRowDetails } from "./GuideRowDetails";
import { FOCUS_ERRORS } from "./helpers";
import {
  AnnotatedGuide,
  AnnotatedStatuses,
  UncommittedGuide,
  isUncommittedGuide,
} from "./useInspectGuideClientStore";

const Pill = ({
  label,
  color = "gray",
  children,
}: {
  label: string;
  color?: StatusColor | "disabled";
  children: React.ReactNode;
}) => {
  return (
    <Stack
      direction="row"
      align="center"
      gap="0_5"
      px="1"
      height="5"
      bg="surface-2"
      rounded="full"
      border="px"
      borderColor="gray-4"
    >
      <Text as="span" size="0" color={color} weight="medium">
        {label}
      </Text>
      {children}
    </Stack>
  );
};

type StatusSummary = {
  color: StatusColor;
  label: string;
  tooltip: string;
};

const getStatusSummary = (
  guide: AnnotatedGuide | UncommittedGuide,
): StatusSummary => {
  if (isUncommittedGuide(guide)) {
    return {
      color: "red",
      label: "Inactive",
      tooltip: "This guide has never been committed and published yet",
    };
  }

  const { annotation } = guide;

  if (!annotation.active.status) {
    return {
      color: "red",
      label: "Inactive",
      tooltip: "This guide is inactive",
    };
  }
  if (annotation.archived.status) {
    return {
      color: "red",
      label: "Archived",
      tooltip: "User has already dismissed this guide",
    };
  }
  if (!annotation.targetable.status) {
    return {
      color: "red",
      label: "Not targeted",
      tooltip: annotation.targetable.message,
    };
  }
  if (annotation.selectable.status === undefined) {
    return {
      color: "red",
      label: "Not found",
      tooltip: "No component that can query this guide was found",
    };
  }
  if (!annotation.activatable.status) {
    return {
      color: "red",
      label: "Not activated",
      tooltip: "This guide cannot be activated in the current location",
    };
  }
  if (annotation.selectable.status === "queried") {
    return {
      color: "gray",
      label: "Queued",
      tooltip: "This guide is queried but is not ready to display",
    };
  }
  if (annotation.selectable.status === "throttled") {
    return {
      color: "yellow",
      label: "Throttled",
      tooltip:
        "This guide is queried and ready to display, but throttled currently",
    };
  }
  if (annotation.selectable.status === "returned") {
    return {
      color: "blue",
      label: "Display",
      tooltip: "This guide is queried and ready to display",
    };
  }
  // Should never happen though.
  return { color: "red", label: "Unknown status", tooltip: "Unknown status" };
};

type StatusDot = {
  color: StatusColor;
  tooltip?: string;
};

const getStatusDots = (
  guide: AnnotatedGuide | UncommittedGuide,
): Record<keyof AnnotatedStatuses, StatusDot> => {
  if (isUncommittedGuide(guide)) {
    return {
      active: { color: "gray" },
      archived: { color: "gray" },
      targetable: { color: "gray" },
      activatable: { color: "gray" },
      selectable: { color: "gray" },
    };
  }

  const { annotation } = guide;

  const active: StatusDot = {
    color: annotation.active.status ? "blue" : "red",
    tooltip: `Active: ${annotation.active.status ? "Yes" : "No"}`,
  };

  const archived: StatusDot = {
    color: annotation.archived.status ? "red" : "blue",
    tooltip: `Archived: ${annotation.archived.status ? "Yes" : "No"}`,
  };

  const targetable: StatusDot = {
    color: annotation.targetable.status ? "blue" : "red",
    tooltip: `Targeted: ${annotation.targetable.status ? "Yes" : "No"}`,
  };

  const activatable: StatusDot = {
    color: annotation.activatable.status ? "blue" : "red",
    tooltip: `Activated: ${annotation.activatable.status ? "Yes" : "No"}`,
  };

  let selectable: StatusDot;
  switch (annotation.selectable.status) {
    case "returned":
      selectable = { color: "blue", tooltip: "Ready for display" };
      break;

    case "throttled":
      selectable = { color: "yellow", tooltip: "Throttled" };
      break;

    case "queried":
      selectable = { color: "gray", tooltip: "Queued" };
      break;

    case undefined:
    default:
      selectable = { color: "red", tooltip: "Not found" };
      break;
  }

  return { active, archived, targetable, activatable, selectable };
};

type Props = {
  guide: UncommittedGuide | AnnotatedGuide;
  orderIndex: number;
  isExpanded: boolean;
  onClick: (guideKey: string) => void;
};

export const GuideRow = ({ guide, orderIndex, isExpanded, onClick }: Props) => {
  const { client } = useGuideContext();
  const { debugSettings } = useStore(client.store, (state) => ({
    debugSettings: state.debug || {},
  }));
  const [isHovered, setIsHovered] = React.useState(false);

  const focusedGuideKeys = debugSettings.focusedGuideKeys || {};
  const hasFocus = Object.keys(focusedGuideKeys).length > 0;
  const isFocused = !!focusedGuideKeys[guide.key];

  const dots = getStatusDots(guide);
  const summary = getStatusSummary(guide);

  return (
    <Box
      rounded="3"
      overflow="hidden"
      border="px"
      borderStyle="solid"
      borderColor={isExpanded ? "gray-6" : "transparent"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer" }}
    >
      <Stack
        h="7"
        px="1"
        gap="1"
        align="center"
        justify="space-between"
        rounded="3"
        overflow="hidden"
        border="px"
        borderStyle="solid"
        borderColor={
          isExpanded
            ? "transparent"
            : isFocused
              ? "gray-6"
              : isHovered
                ? "gray-4"
                : "transparent"
        }
        backgroundColor={
          isExpanded
            ? "surface-2"
            : isFocused
              ? "gray-2"
              : isHovered
                ? "surface-2"
                : "transparent"
        }
        onClick={() => onClick(guide.key)}
      >
        {/* Left section: order + key */}
        <Stack align="center" gap="1_5" style={{ minWidth: 0, flex: 1 }}>
          <Stack w="7" justify="space-between" align="center" gap="0_5">
            <Box w="3">
              {!guide.bypass_global_group_limit && (
                <Icon
                  icon={Gauge}
                  size="0"
                  color="gray"
                  alt="Subject to throttling"
                />
              )}
            </Box>
            <Text
              as="span"
              size="1"
              weight="medium"
              color={guide.bypass_global_group_limit ? "blue" : "default"}
              style={{ flexShrink: 0 }}
            >
              {orderIndex + 1}
            </Text>
          </Stack>
          <Tooltip
            label={`${guide.key}${guide.bypass_global_group_limit ? " (unthrottled)" : ""}`}
          >
            <Text
              as="code"
              size="1"
              weight="medium"
              color="default"
              style={{
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "200px",
              }}
            >
              {guide.key}
            </Text>
          </Tooltip>
        </Stack>

        {/* Right section: verdict + pills + focus */}
        <Stack align="center" gap="1_5" style={{ flexShrink: 0 }}>
          {!hasFocus && (
            <Tooltip label={summary.tooltip}>
              <Tag size="0" variant="soft" color={summary.color}>
                {summary.label}
              </Tag>
            </Tooltip>
          )}

          <Pill
            label="Elig:"
            color={
              isUncommittedGuide(guide)
                ? "disabled"
                : guide.annotation.isEligible
                  ? "blue"
                  : "gray"
            }
          >
            <StatusDot
              color={dots.active.color}
              tooltip={dots.active.tooltip!}
            />
            <StatusDot
              color={dots.archived.color}
              tooltip={dots.archived.tooltip!}
            />
            <StatusDot
              color={dots.targetable.color}
              tooltip={dots.targetable.tooltip!}
            />
          </Pill>
          <Pill
            label="Vis:"
            color={
              isUncommittedGuide(guide)
                ? "disabled"
                : guide.annotation.isQualified &&
                    guide.annotation.selectable.status === "returned"
                  ? "blue"
                  : "gray"
            }
          >
            <StatusDot
              color={dots.activatable.color}
              tooltip={dots.activatable.tooltip!}
            />
            <StatusDot
              color={dots.selectable.color}
              tooltip={dots.selectable.tooltip!}
            />
          </Pill>

          <Tooltip
            label={
              isUncommittedGuide(guide)
                ? FOCUS_ERRORS.focusUncommittedGuide
                : guide.annotation.selectable.status === undefined
                  ? FOCUS_ERRORS.focusUnselectableGuide
                  : ""
            }
            enabled={
              isUncommittedGuide(guide) ||
              guide.annotation.selectable.status === undefined
            }
          >
            <Button
              size="0"
              variant={isFocused ? "solid" : "outline"}
              color={isFocused ? "blue" : "gray"}
              disabled={
                isUncommittedGuide(guide) ||
                guide.annotation.selectable.status === undefined
              }
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                client.setDebug({
                  ...debugSettings,
                  focusedGuideKeys: isFocused ? {} : { [guide.key]: true },
                });
              }}
            >
              Focus
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {isExpanded && <GuideRowDetails guide={guide} />}
    </Box>
  );
};
