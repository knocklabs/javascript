import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Icon } from "@telegraph/icon";
import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import * as React from "react";

export const GuideContextDetails = () => {
  const { client } = useGuideContext();
  const [isExpanded, setIsExpanded] = React.useState(false);

  const { defaultGroup, debugSettings } = useStore(client.store, (state) => {
    return {
      defaultGroup: state.guideGroups[0],
      debugSettings: {
        skipEngagementTracking: !!state.debug?.skipEngagementTracking,
        ignoreDisplayInterval: !!state.debug?.ignoreDisplayInterval,
      },
    };
  });
  const displayInterval = defaultGroup?.display_interval ?? null;

  return (
    <Stack direction="column" borderTop="px">
      <Stack
        h="5"
        px="2"
        bg="gray-3"
        align="center"
        gap="1"
        style={{ cursor: "pointer" }}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <Text as="span" size="0" weight="medium">
          More
        </Text>
        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </Stack>

      {isExpanded && (
        <Stack direction="column">
          <Stack
            align="center"
            justify="space-between"
            py="1"
            px="2"
            borderTop="px"
          >
            <Stack align="center" gap="1">
              <Text as="span" size="0" weight="medium">
                Client-only engagement
              </Text>
              <Tooltip label="Contain engagement actions to the client side only while in preview without sending engagement events to the API">
                <Icon icon={Info} size="0" color="gray" aria-hidden />
              </Tooltip>
            </Stack>
            <Button
              size="0"
              variant="soft"
              color={debugSettings.skipEngagementTracking ? "green" : "gray"}
              onClick={() =>
                client.setDebug({
                  ...debugSettings,
                  skipEngagementTracking: !debugSettings.skipEngagementTracking,
                })
              }
            >
              {debugSettings.skipEngagementTracking ? "On" : "Off"}
            </Button>
          </Stack>

          <Stack direction="column" py="1" px="2">
            <Stack align="center" justify="space-between">
              <Text as="span" size="0" weight="medium">
                Ignore throttle setting
              </Text>
              <Button
                size="0"
                variant="soft"
                color={debugSettings.ignoreDisplayInterval ? "green" : "gray"}
                onClick={() =>
                  client.setDebug({
                    ignoreDisplayInterval: !debugSettings.ignoreDisplayInterval,
                  })
                }
              >
                {debugSettings.ignoreDisplayInterval ? "On" : "Off"}
              </Button>
            </Stack>
            <Stack direction="row" gap="0_5" py="1">
              <Text as="span" size="0" color="gray">
                Throttle interval:{" "}
                {displayInterval === null
                  ? "(none)"
                  : `Every ${displayInterval}s`}
              </Text>
            </Stack>
          </Stack>

          <Stack direction="column" py="1" px="2" borderTop="px">
            <Text as="span" size="0" weight="medium">
              Target params
            </Text>
            <Stack direction="column" gap="0_5" mt="1">
              <Text as="span" size="0" color="gray">
                Tenant
              </Text>
              <Text as="code" size="0">
                {client.targetParams.tenant ? (
                  <Box
                    rounded="2"
                    overflow="auto"
                    backgroundColor="gray-2"
                    border="px"
                    style={{ maxHeight: "200px" }}
                  >
                    <pre style={{ fontSize: "11px", margin: 0 }}>
                      <code>{client.targetParams.tenant}</code>
                    </pre>
                  </Box>
                ) : (
                  <Text as="code" size="0">
                    -
                  </Text>
                )}
              </Text>
            </Stack>

            <Stack direction="column" gap="0_5">
              <Text as="span" size="0" color="gray">
                Data
              </Text>
              {client.targetParams.data ? (
                <Box
                  rounded="2"
                  overflow="auto"
                  backgroundColor="gray-2"
                  border="px"
                  style={{ maxHeight: "200px" }}
                >
                  <pre style={{ fontSize: "11px", margin: 0 }}>
                    <code>
                      {JSON.stringify(client.targetParams.data, null, 2)}
                    </code>
                  </pre>
                </Box>
              ) : (
                <Text as="code" size="0">
                  -
                </Text>
              )}
            </Stack>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
