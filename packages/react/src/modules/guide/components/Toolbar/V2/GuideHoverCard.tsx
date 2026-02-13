import * as HoverCard from "@radix-ui/react-hover-card";
import { Box, Stack } from "@telegraph/layout";
import * as React from "react";

import {
  AnnotatedGuide,
  UnknownGuide,
  isUnknownGuide,
} from "./useInspectGuideClientStore";

type Props = {
  guide: AnnotatedGuide | UnknownGuide;
};

export const GuideHoverCard = ({
  children,
  guide,
}: React.PropsWithChildren<Props>) => {
  if (isUnknownGuide(guide)) {
    return <Stack align="center">{children}</Stack>;
  }

  // Prune out internal or legacy fields.
  const {
    annotation: _annotation,
    activation_location_rules: _activation_location_rules,
    priority: _priority,
    ...rest
  } = guide;

  return (
    <HoverCard.Root>
      <HoverCard.Trigger>
        <Stack align="center">{children}</Stack>
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content sideOffset={44} side="left">
          <Box
            px="2"
            shadow="2"
            rounded="3"
            border="px"
            overflow="auto"
            backgroundColor="surface-2"
            style={{
              width: "450px",
              maxHeight: "600px",
            }}
          >
            <pre
              style={{
                fontSize: "11px",
              }}
            >
              <code>{JSON.stringify(rest, null, 2)}</code>
            </pre>
          </Box>
          <HoverCard.Arrow />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
