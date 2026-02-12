import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Tag } from "@telegraph/tag";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import {
  CheckCircle2,
  CircleDashed,
  Eye,
  LocateFixed,
  UserCircle2,
} from "lucide-react";
import * as React from "react";

import { GuideHoverCard } from "./GuideHoverCard";
import {
  AnnotatedGuide,
  UnknownGuide,
  isUnknownGuide,
} from "./useInspectGuideClientStore";

const Row = ({ children }: React.PropsWithChildren) => (
  <Stack h="7" px="2" borderTop="px" justify="space-between" align="center">
    {children}
  </Stack>
);

type Props = {
  guide: UnknownGuide | AnnotatedGuide;
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

      <Stack justify="flex-end">
        {!isUnknownGuide(guide) && (
          <Stack gap="1">
            <Tooltip
              label={
                guide.annotation.activatable.status
                  ? "This guide can be activated at the current location"
                  : "This guide cannot be activated at the current location"
              }
            >
              <Button
                px="1"
                size="1"
                variant="soft"
                color={guide.annotation.activatable.status ? "green" : "red"}
                leadingIcon={{ icon: LocateFixed, alt: "Target" }}
              />
            </Tooltip>
          </Stack>
        )}
        {!isUnknownGuide(guide) && (
          <Stack px="1" align="center">
            <Box h="3" borderLeft="px" borderColor="gray-6" />
          </Stack>
        )}
        <Stack gap="1">
          {!isUnknownGuide(guide) && (
            <>
              <Tooltip
                label={
                  guide.annotation.targetable.status
                    ? "This user is being targeted"
                    : guide.annotation.targetable.message
                }
              >
                <Button
                  px="1"
                  size="1"
                  variant="soft"
                  color={guide.annotation.targetable.status ? "green" : "red"}
                  leadingIcon={{ icon: UserCircle2, alt: "Target" }}
                />
              </Tooltip>
              <Tooltip
                label={
                  guide.annotation.archived.status
                    ? "User has already dismissed this guide"
                    : "User has not dismissed this guide"
                }
              >
                <Button
                  px="1"
                  size="1"
                  variant="soft"
                  color={guide.annotation.archived.status ? "red" : "green"}
                  leadingIcon={{ icon: Eye, alt: "Not archived" }}
                />
              </Tooltip>
            </>
          )}
          <Tooltip
            label={
              isUnknownGuide(guide)
                ? "This guide has never been committed and published yet"
                : !guide.active
                  ? "This guide is not active"
                  : "This guide is active"
            }
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
      </Stack>
    </Row>
  );
};
