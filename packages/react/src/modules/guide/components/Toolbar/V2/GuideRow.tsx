import { Button } from "@telegraph/button";
import { Stack } from "@telegraph/layout";
import { Tag } from "@telegraph/tag";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import { CheckCircle2, CircleDashed, Eye, UserCircle2 } from "lucide-react";
import * as React from "react";

import { GuideHoverCard } from "./GuideHoverCard";
import { InspectedGuide, MissingGuide } from "./useInspectGuideClientStore";

const Row = ({ children }: React.PropsWithChildren) => (
  <Stack h="7" px="2" borderTop="px" justify="space-between" align="center">
    {children}
  </Stack>
);

type Props = {
  guide: MissingGuide | InspectedGuide;
  orderIndex: number;
};

export const GuideRow = ({ guide, orderIndex }: Props) => {
  return (
    <Row>
      <Stack h="6" justify="flex-start" align="center" gap="2">
        <Tag
          size="0"
          variant="soft"
          color={guide.bypass_global_group_limit ? "blue" : "default"}
        >
          {orderIndex + 1}
        </Tag>
        <GuideHoverCard guide={guide}>
          <Text as="code" size="1" color={guide.active ? "black" : "disabled"}>
            {guide.key}
          </Text>
        </GuideHoverCard>
      </Stack>

      <Stack gap="1" justify="flex-end">
        {guide.__typename === "Guide" && (
          <>
            <Tooltip
              label={
                !guide.inspection.targetable.status &&
                guide.inspection.targetable.message
              }
              enabled={!guide.inspection.targetable.status}
            >
              <Button
                px="1"
                size="1"
                variant="soft"
                color={guide.inspection.targetable.status ? "green" : "red"}
                leadingIcon={{ icon: UserCircle2, alt: "Target" }}
              />
            </Tooltip>
            <Tooltip
              label="User has already archived this guide"
              enabled={guide.inspection.archived.status}
            >
              <Button
                px="1"
                size="1"
                variant="soft"
                color={guide.inspection.archived.status ? "red" : "green"}
                leadingIcon={{ icon: Eye, alt: "Not archived" }}
              />
            </Tooltip>
          </>
        )}
        <Tooltip
          label={
            guide.__typename === "MissingGuide"
              ? "This guide has never been committed and published yet"
              : "This guide is not active"
          }
          enabled={!guide.active}
        >
          <Button
            px="1"
            size="1"
            variant="soft"
            color={guide.active ? "green" : "red"}
            leadingIcon={
              guide.active
                ? { icon: CheckCircle2, alt: "Active" }
                : { icon: CircleDashed, alt: "Inactive" }
            }
          />
        </Tooltip>
      </Stack>
    </Row>
  );
};
