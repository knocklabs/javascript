import { Box, Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";

import {
  StatusColor,
  GuideAnnotatedStatusDot as StatusDot,
} from "./GuideAnnotatedStatusDot";
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
}: {
  label: string;
  value: string;
  color: StatusColor;
}) => (
  <Stack align="center" gap="1">
    <StatusDot color={color} tooltip={`${label}: ${value}`} />
    <Text as="span" size="1" weight="medium">
      {label}:
    </Text>
    <Text as="span" size="1" weight="medium" color={color}>
      {value}
    </Text>
  </Stack>
);

const getDisplayValue = (
  status: "returned" | "throttled" | "queried" | undefined,
): { value: string; color: StatusColor } => {
  switch (status) {
    case "returned":
      return { value: "Ready to display", color: "blue" };
    case "throttled":
      return { value: "Throttled", color: "yellow" };
    case "queried":
      return { value: "Queued", color: "gray" };
    default:
      return { value: "Not found", color: "red" };
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
  const display = getDisplayValue(annotation.selectable.status);

  return (
    <Stack px="3" py="2" gap="2" direction="row" align="flex-start">
      <CardContainer title="Eligibility">
        <StatusRow
          label="Active"
          value={annotation.active.status ? "Yes" : "No"}
          color={annotation.active.status ? "blue" : "red"}
        />
        <StatusRow
          label="Not archived"
          value={!annotation.archived.status ? "Yes" : "No"}
          color={!annotation.archived.status ? "blue" : "red"}
        />
        <StatusRow
          label="Targeting"
          value={annotation.targetable.status ? "Yes" : "No"}
          color={annotation.targetable.status ? "blue" : "red"}
        />
      </CardContainer>

      <CardContainer title="Visibility">
        <StatusRow
          label="Activation"
          value={annotation.activatable.status ? "Yes" : "No"}
          color={annotation.activatable.status ? "blue" : "red"}
        />
        <StatusRow
          label="Display"
          value={display.value}
          color={display.color}
        />
      </CardContainer>
    </Stack>
  );
};
