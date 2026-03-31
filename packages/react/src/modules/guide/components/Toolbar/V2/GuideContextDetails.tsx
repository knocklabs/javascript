import { useGuideContext, useStore } from "@knocklabs/react-core";
import { Box, Stack } from "@telegraph/layout";
import { Toggle } from "@telegraph/toggle";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";

type Props = {
  activeOnly: boolean;
  onActiveOnlyChange: (value: boolean) => void;
};

export const GuideContextDetails = ({
  activeOnly,
  onActiveOnlyChange,
}: Props) => {
  const { client } = useGuideContext();
  const { debugSettings } = useStore(client.store, (state) => ({
    debugSettings: state.debug || {},
  }));

  return (
    <Box py="3" px="3">
      <Stack direction="column" gap="1" width="full">
        <Text as="span" size="1" weight="medium" display="block">
          Toolbar settings
        </Text>
        <Stack direction="column" gap="1">
          <Stack direction="row" gap="2" align="center" h="7">
            <Tooltip label="Contain engagement actions to client side only">
              <Text
                as="span"
                size="1"
                weight="medium"
                color="gray"
                width="36"
                mt="1"
              >
                Sandbox engagement
              </Text>
            </Tooltip>
            <Toggle.Default
              size="1"
              pt="1_5"
              value={!!debugSettings.skipEngagementTracking}
              onValueChange={(value: boolean) => {
                client.setDebug({
                  ...debugSettings,
                  skipEngagementTracking: value,
                });
              }}
            />
          </Stack>
          <Stack direction="row" gap="2" align="center" h="7">
            <Tooltip label="Ignore throttle and show next guide immediately">
              <Text
                as="span"
                size="1"
                weight="medium"
                color="gray"
                width="36"
                mt="1"
              >
                Ignore throttle
              </Text>
            </Tooltip>
            <Toggle.Default
              size="1"
              pt="1_5"
              value={!!debugSettings.ignoreDisplayInterval}
              onValueChange={(value: boolean) => {
                client.setDebug({
                  ...debugSettings,
                  ignoreDisplayInterval: value,
                });
              }}
            />
          </Stack>
          <Stack direction="row" gap="2" align="center" h="7">
            <Tooltip label="Only show guides that are active">
              <Text
                as="span"
                size="1"
                weight="medium"
                color="gray"
                width="36"
                mt="1"
              >
                Active only
              </Text>
            </Tooltip>
            <Toggle.Default
              size="1"
              pt="1_5"
              value={activeOnly}
              onValueChange={onActiveOnlyChange}
            />
          </Stack>
        </Stack>
      </Stack>
      <Stack direction="column" gap="1" width="full">
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
            as="span"
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
