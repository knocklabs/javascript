import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";
import { Minimize2, Undo2 } from "lucide-react";
import React from "react";

import { KnockButton } from "../KnockButton";
import { MAX_Z_INDEX } from "../shared";
import "../styles.css";

import { detectToolbarParam } from "./helpers";

const useInspectGuideClientStore = () => {
  const { client } = useGuideContext();

  const snapshot = useStore(client.store, (state) => {
    return {
      debug: state.debug,
    };
  });

  if (!snapshot.debug?.debugging) {
    return;
  }

  // TODO: Transform the raw client state into more useful data for debugging.
  return {};
};

export const V2 = () => {
  const { client } = useGuideContext();

  const [isVisible, setIsVisible] = React.useState(detectToolbarParam());
  const [isCollapsed, setIsCollapsed] = React.useState(true);

  React.useEffect(() => {
    if (isVisible) {
      return client.setDebug();
    }

    return client.unsetDebug();
  }, [isVisible, client]);

  const data = useInspectGuideClientStore();
  if (!data) {
    return null;
  }

  return (
    <Box
      position="fixed"
      top="4"
      right="4"
      style={{
        zIndex: MAX_Z_INDEX,
      }}
    >
      {isCollapsed ? (
        <KnockButton onClick={() => setIsCollapsed(false)} />
      ) : (
        <Stack
          direction="column"
          backgroundColor="surface-2"
          shadow="2"
          rounded="3"
          border="px"
          overflow="hidden"
          style={{ width: "400px" }}
        >
          <Stack
            w="full"
            p="2"
            justify="space-between"
            direction="row"
            style={{ boxSizing: "border-box" }}
          >
            <Box style={{ width: "220px" }}>
              <Text as="div" size="1" weight="medium" w="full" maxWidth="40">
                Toolbar v2 placeholder
              </Text>
            </Box>

            <Stack gap="2">
              <Button
                onClick={() => setIsVisible(false)}
                size="1"
                variant="soft"
                trailingIcon={{ icon: Undo2, "aria-hidden": true }}
              >
                Exit
              </Button>
              <Button
                onClick={() => setIsCollapsed(true)}
                size="1"
                variant="soft"
                leadingIcon={{ icon: Minimize2, alt: "Collapse guide toolbar" }}
              />
            </Stack>
          </Stack>
        </Stack>
      )}
    </Box>
  );
};
