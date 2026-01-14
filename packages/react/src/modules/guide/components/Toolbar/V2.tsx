import { Button } from "@telegraph/button";
import { Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";
import { Minimize2 } from "lucide-react";
import { useState } from "react";

import { KnockButton } from "./KnockButton";
import { MAX_Z_INDEX } from "./helpers";
import "./styles.css";

export const V2 = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return <KnockButton onClick={() => setIsCollapsed(false)} />;
  }

  return (
    <Stack
      gap="2"
      align="center"
      position="fixed"
      top="4"
      right="4"
      backgroundColor="surface-2"
      bg="surface-2"
      shadow="3"
      rounded="3"
      py="2"
      px="3"
      data-tgph-appearance="dark"
      style={{ zIndex: MAX_Z_INDEX }}
    >
      <Stack gap="2" align="center" direction="row">
        <Text
          as="div"
          size="1"
          weight="medium"
          w="full"
          maxWidth="40"
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
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
  );
};
