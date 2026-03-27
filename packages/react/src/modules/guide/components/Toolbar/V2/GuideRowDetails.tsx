import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";

import {
  StatusColor,
  GuideAnnotatedStatusDot as StatusDot,
} from "./GuideAnnotatedStatusDot";
import { ERROR_MESSAGE } from "./helpers";
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
    <Stack direction="column" gap="1" mt="1">
      {children}
    </Stack>
  </Stack>
);

const StatusRow = ({
  label,
  value,
  color,
  tooltip,
}: {
  label: string;
  value: string;
  color: StatusColor;
  tooltip?: React.ReactNode;
}) => {
  return (
    <Stack align="center" gap="1">
      <Tooltip enabled={!!tooltip} label={tooltip} delayDuration={500}>
        <Stack as="span" align="center" gap="1" display="inline-flex">
          <StatusDot color={color} tooltip={`${label}: ${value}`} />
          <Text as="span" size="1" weight="medium">
            {label}:
          </Text>
          <Text as="span" size="1" weight="medium" color={color}>
            {value}
          </Text>
        </Stack>
      </Tooltip>
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
        description: "This guide is queried and ready to display",
      };
    case "throttled":
      return {
        label: "Throttled",
        color: "yellow",
        description:
          "This guide is queried and ready to display, but throttled currently",
      };
    case "queried":
      return {
        label: "Queued",
        color: "gray",
        description: "This guide is queried but is not ready to display",
      };
    default:
      return {
        label: "Not queried",
        color: "red",
        description: `This guide is not queried (${ERROR_MESSAGE.focusUnselectableGuide.toLowerCase()})`,
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
          tooltip="Eligible if the guide is currently active"
        />
        <StatusRow
          label="Archived"
          value={annotation.archived.status ? "Yes" : "No"}
          color={annotation.archived.status ? "red" : "blue"}
          tooltip="Eligible if the guide has not been dismissed/archived by the user already"
        />
        <StatusRow
          label="Targeting"
          value={annotation.targetable.status ? "Yes" : "No"}
          color={annotation.targetable.status ? "blue" : "red"}
          tooltip="Eligible if the user meets the guide's targeting conditions"
        />
      </CardContainer>

      <CardContainer title="Visibility">
        <StatusRow
          label="Activation"
          value={annotation.activatable.status ? "Yes" : "No"}
          color={annotation.activatable.status ? "blue" : "red"}
          tooltip="Visible when the user's current location matches the guide's activation rules"
        />
        <StatusRow
          label="Display"
          value={selectableStatusSummary.label}
          color={selectableStatusSummary.color}
          tooltip={
            <Text as="span" size="1">
              Visible when the guide is queried via `useGuide(s)` in the current
              page,
              <br />
              and ready to display per its position in the display pipeline:
              <br />
              {selectableStatusSummary.description}
            </Text>
          }
        />
      </CardContainer>
    </Stack>
  );
};
