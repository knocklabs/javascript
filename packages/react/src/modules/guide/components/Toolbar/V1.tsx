import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Stack } from "@telegraph/layout";
import { Tag } from "@telegraph/tag";
import { Text } from "@telegraph/typography";
import { Minimize2, Undo2, Wrench } from "lucide-react";
import { useState } from "react";

import { KnockButton } from "./KnockButton";
import { MAX_Z_INDEX } from "./helpers";
import "./styles.css";

export const V1 = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { client } = useGuideContext();
  const debugState = useStore(client.store, (state) => state.debug);

  if (!debugState?.forcedGuideKey) {
    return null;
  }

  const handleExit = () => {
    client.exitDebugMode();
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  if (isCollapsed) {
    return <KnockButton onClick={handleToggleCollapse} />;
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
        <Tag
          color="green"
          variant="soft"
          icon={{ icon: Wrench, "aria-hidden": true }}
        >
          Debug
        </Tag>

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
          {debugState.forcedGuideKey}
        </Text>

        <Button
          onClick={handleExit}
          size="1"
          variant="soft"
          trailingIcon={{ icon: Undo2, "aria-hidden": true }}
        >
          Exit
        </Button>

        <Button
          onClick={handleToggleCollapse}
          size="1"
          variant="soft"
          leadingIcon={{ icon: Minimize2, alt: "Collapse guide toolbar" }}
        />
      </Stack>
    </Stack>
  );
};
