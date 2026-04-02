import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";

import {
  StatusColor,
  GuideAnnotatedStatusDot as StatusDot,
} from "./GuideAnnotatedStatusDot";
import { sharedTooltipProps } from "./helpers";
import {
  AnnotatedGuide,
  UncommittedGuide,
  isUncommittedGuide,
} from "./useInspectGuideClientStore";

const CardContainer = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Stack
    direction="column"
    justify="flex-start"
    gap="1"
    px="1_5"
    py="1"
    rounded="2"
    bg="surface-1"
    border="px"
    borderColor="gray-4"
    style={{ flex: 1 }}
  >
    <Text as="span" size="0" color="gray" weight="medium">
      {title}
    </Text>
    <Stack direction="column" gap="1">
      {children}
    </Stack>
  </Stack>
);

const StatusRow = ({
  label,
  value,
  color,
  tooltip,
  children,
}: {
  label: string;
  value: string;
  color: StatusColor;
  tooltip?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  return (
    <Stack align="center" gap="1">
      <Stack as="span" align="center" gap="1" display="inline-flex">
        <Tooltip enabled={!!tooltip} label={tooltip} {...sharedTooltipProps}>
          <Stack gap="1">
            <StatusDot color={color} tooltip={`${label}: ${value}`} />
            <Text as="span" size="1" weight="medium">
              {label}:
            </Text>
            {/* User children over value when provided, for cases when we want to
                have its own tooltip over it */}
            {!children && (
              <Text as="span" size="1" weight="medium" color={color}>
                {value}
              </Text>
            )}
          </Stack>
        </Tooltip>
        {children}
      </Stack>
    </Stack>
  );
};

export type StatusSummary = {
  color: StatusColor;
  label: string;
  description: string;
};

export const getSelectableStatusSummary = (
  status: "returned" | "throttled" | "queried" | undefined,
): StatusSummary => {
  switch (status) {
    case "returned":
      return {
        label: "Ready to display",
        color: "blue",
        description: "The guide is queried and ready to render.",
      };
    case "throttled":
      return {
        label: "Throttled",
        color: "yellow",
        description: "The guide is queried but held back by throttle settings.",
      };
    case "queried":
      return {
        label: "Queued",
        color: "gray",
        description:
          "The guide is queried but waiting behind higher-priority guides.",
      };
    default:
      return {
        label: "Not queried",
        color: "red",
        description: "No useGuide(s) call on this page matches this guide.",
      };
  }
};

export const GuideRowDetails = ({
  guide,
}: {
  guide: AnnotatedGuide | UncommittedGuide;
}) => {
  if (isUncommittedGuide(guide)) {
    return (
      <Box px="3" py="2">
        <Text as="span" size="1" color="gray">
          This guide has never been committed and published.
        </Text>
      </Box>
    );
  }

  const { annotation } = guide;
  const selectableStatusSummary = getSelectableStatusSummary(
    annotation.selectable.status,
  );

  return (
    <Stack px="3" py="2" gap="2" direction="row" align="flex-start">
      <CardContainer title="Eligibility">
        <StatusRow
          label="Active"
          value={annotation.active.status ? "Yes" : "No"}
          color={annotation.active.status ? "blue" : "red"}
          tooltip="Whether the guide is active in this environment."
        />
        <StatusRow
          label="Archived"
          value={annotation.archived.status ? "Yes" : "No"}
          color={annotation.archived.status ? "red" : "blue"}
          tooltip="Whether the current user has dismissed this guide."
        />
        <StatusRow
          label="Targeting"
          value={annotation.targetable.status ? "Yes" : "No"}
          color={annotation.targetable.status ? "blue" : "red"}
          tooltip="Whether the current user matches the guide's targeting conditions."
        />
      </CardContainer>

      <CardContainer title="Visibility">
        <StatusRow
          label="Activation"
          value={annotation.activatable.status ? "Yes" : "No"}
          color={annotation.activatable.status ? "blue" : "red"}
          tooltip="Whether the current page matches the guide's activation rules."
        />
        <StatusRow
          label="Display"
          value={selectableStatusSummary.label}
          color={selectableStatusSummary.color}
          tooltip="Whether the guide has been queried and is ready to render on the current page."
        >
          <Tooltip
            label={selectableStatusSummary.description}
            {...sharedTooltipProps}
          >
            <Text
              as="span"
              size="1"
              weight="medium"
              color={selectableStatusSummary.color}
            >
              {selectableStatusSummary.label}
            </Text>
          </Tooltip>
        </StatusRow>
      </CardContainer>
    </Stack>
  );
};
