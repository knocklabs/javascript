import { useGuideContext } from "@knocklabs/react-core";
import { Box, Stack } from "@telegraph/layout";
import { Tooltip } from "@telegraph/tooltip";
import { Text } from "@telegraph/typography";

export const GuideContextDetails = () => {
  const { client } = useGuideContext();

  return (
    <Box py="3" px="3">
      <Tooltip
        label={
          <Text as="span" size="1">
            The tenant and data payload passed to the guide client that are used
            for targeting
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
          style={{
            whiteSpace: "nowrap",
          }}
        >
          Target params
        </Text>
      </Tooltip>
      <Stack direction="column" gap="2" mt="2">
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
    </Box>
  );
};
