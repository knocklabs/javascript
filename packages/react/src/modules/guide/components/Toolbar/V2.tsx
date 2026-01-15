import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";
import { Minimize2 } from "lucide-react";
import { useState } from "react";

import { KnockButton } from "./KnockButton";
import { MAX_Z_INDEX } from "./helpers";
import "./styles.css";

export const V2 = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <Box
      position="fixed"
      top="4"
      right="4"
      data-tgph-appearance="dark"
      style={{ zIndex: MAX_Z_INDEX }}
    >
      {isCollapsed ? (
        <KnockButton onClick={() => setIsCollapsed(false)} />
      ) : (
        <Stack
          backgroundColor="surface-2"
          gap="2"
          align="center"
          shadow="3"
          rounded="3"
          py="2"
          px="3"
        >
          <Stack gap="2" align="center" direction="row">
            <Text as="div" size="1" weight="medium" w="full" maxWidth="40">
              Toolbar v2 placeholder
            </Text>

            <Button
              onClick={() => setIsCollapsed(true)}
              size="1"
              variant="soft"
              leadingIcon={{ icon: Minimize2, alt: "Collapse guide toolbar" }}
            />
          </Stack>
        </Stack>
      )}
    </Box>
  );
};
