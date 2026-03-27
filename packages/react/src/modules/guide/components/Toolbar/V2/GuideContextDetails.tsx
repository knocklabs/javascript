import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Button } from "@telegraph/button";
import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";
import { Box as BoxIcon, Gauge } from "lucide-react";

export const GuideContextDetails = () => {
  const { client } = useGuideContext();
  const { debugSettings } = useStore(client.store, (state) => ({
    debugSettings: state.debug || {},
  }));

  return (
    <Box py="3" px="3">
      <Stack direction="column" gap="2" width="full">
        <Text as="label" size="1" weight="medium" display="block">
          Settings
        </Text>
        <Stack direction="row" gap="2">
          <Tooltip label="Sandbox: Contain engagement actions to client side only">
            <Button
              size="1"
              variant={
                debugSettings.skipEngagementTracking ? "outline" : "ghost"
              }
              color={debugSettings.skipEngagementTracking ? "blue" : "gray"}
              icon={{ icon: BoxIcon, alt: "Sandbox mode" }}
              onClick={() => {
                client.setDebug({
                  ...debugSettings,
                  skipEngagementTracking: !debugSettings.skipEngagementTracking,
                });
              }}
            />
          </Tooltip>

          <Tooltip label="Ignore throttle: Show next guide immediately">
            <Button
              size="1"
              variant={
                debugSettings.ignoreDisplayInterval ? "outline" : "ghost"
              }
              color={debugSettings.ignoreDisplayInterval ? "blue" : "gray"}
              icon={{ icon: Gauge, alt: "Ignore throttle" }}
              onClick={() => {
                client.setDebug({
                  ...debugSettings,
                  ignoreDisplayInterval: !debugSettings.ignoreDisplayInterval,
                });
              }}
            />
          </Tooltip>
        </Stack>
      </Stack>
      <Stack direction="column" gap="2" width="full">
        <Tooltip
          label={
            <Text as="span" size="1">
              The tenant and data payload passed to the guide client that are
              used for targeting
              <br />
              (via the targetParams prop to KnockGuideProvider)
            </Text>
          }
          delayDuration={500}
        >
          <Text
            as="label"
            size="1"
            weight="medium"
            borderBottom="px"
            borderStyle="dashed"
            mt="4"
            style={{
              whiteSpace: "nowrap",
              width: "fit-content",
            }}
          >
            Target params
          </Text>
        </Tooltip>
        <Stack direction="column" gap="2">
          <Stack direction="row" gap="2" align="center">
            <Text
              as="span"
              size="1"
              weight="medium"
              color="gray"
              width="36"
              mt="1"
            >
              Tenant
            </Text>
            <Box
              rounded="2"
              overflow="auto"
              backgroundColor="surface-2"
              border="px"
              p="1"
              style={{ flex: 1, minWidth: 0 }}
            >
              <pre style={{ fontSize: "11px", margin: 0 }}>
                <code>{client.targetParams.tenant || "-"}</code>
              </pre>
            </Box>
          </Stack>
          <Stack direction="row" gap="2" align="flex-start">
            <Text
              as="span"
              size="1"
              weight="medium"
              color="gray"
              width="36"
              mt="1"
            >
              Data
            </Text>
            <Box
              rounded="2"
              overflow="auto"
              backgroundColor="surface-2"
              border="px"
              p="1"
              style={{
                flex: 1,
                minWidth: 0,
                minHeight: "50px",
                maxHeight: "200px",
              }}
            >
              <pre style={{ fontSize: "11px", margin: 0 }}>
                <code>
                  {client.targetParams.data
                    ? JSON.stringify(client.targetParams.data, null, 2)
                    : "-"}
                </code>
              </pre>
            </Box>
          </Stack>
        </Stack>
      </Stack>
    </Box>
  );
};
