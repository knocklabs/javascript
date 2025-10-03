import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Tooltip } from "@telegraph/tooltip";
import { Stack } from "@telegraph/layout";
import { Tag } from "@telegraph/tag";
import { Text } from "@telegraph/typography";
import { Minimize2, Undo2, Wrench } from "lucide-react";
import { useState } from "react";

import "./styles.css";

// 'max' z index based on max value of a signed 32-bit int
// Ref: https://stackoverflow.com/questions/491052/minimum-and-maximum-value-of-z-index/25461690#25461690
const MAX_Z_INDEX = 2147483647;

export const GuideToolbar = () => {
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
    return (
      <Button
        onClick={handleToggleCollapse}
        position="fixed"
        top="4"
        right="4"
        bg="surface-2"
        shadow="3"
        rounded="3"
        w="10"
        h="10"
        variant="soft"
        data-tgph-appearance="dark"
        aria-label="Expand guide toolbar"
        style={{ zIndex: MAX_Z_INDEX }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <path
            d="M11.6001 32.4V7.59998H16.6365V21.8219H16.7774L22.3067 14.8525H27.9418L21.8138 22.0696L28.4001 32.4H22.7996L18.8555 25.572L16.6365 28.0839V32.4H11.6001Z"
            fill="#EDEEEF"
          />
          <path
            d="M28.4 10.4C28.4 11.9464 27.1467 13.2 25.6 13.2C24.0534 13.2 22.8 11.9464 22.8 10.4C22.8 8.85358 24.0534 7.59998 25.6 7.59998C27.1467 7.59998 28.4 8.85358 28.4 10.4Z"
            fill="#FF573A"
          />
        </svg>
      </Button>
    );
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
          Preview
        </Tag>

        <Tooltip label={debugState.forcedGuideKey}>
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
        </Tooltip>

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
