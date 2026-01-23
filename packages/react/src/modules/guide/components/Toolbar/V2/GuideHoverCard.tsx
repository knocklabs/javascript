import * as HoverCard from "@radix-ui/react-hover-card";
import { Box, Stack } from "@telegraph/layout";
import * as React from "react";

import { InspectedGuide, MissingGuide } from "./useInspectGuideClientStore";

type Props = {
  guide: InspectedGuide | MissingGuide;
};

export const GuideHoverCard = ({
  children,
  guide,
}: React.PropsWithChildren<Props>) => {
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
              {/* TODO: Prune some details */}
              <code>{JSON.stringify(guide, null, 2)}</code>
            </pre>
          </Box>
          <HoverCard.Arrow />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};
