import type {
  SetPreferencesProperties,
  WorkflowPreferences,
} from "@knocklabs/client";
import { usePreferences } from "@knocklabs/react";
import { Stack } from "@telegraph/layout";
import { Text } from "@telegraph/typography";

type WorkflowPreferencesProps = {
  preferences: WorkflowPreferences | undefined;
  onPreferencesChange: (preferenceSet: SetPreferencesProperties) => void;
};

const WorkflowPreferences = ({
  preferences,
  onPreferencesChange,
}: WorkflowPreferencesProps) => {
  return Object.entries(preferences ?? {}).map(([key, value]) => {
    if (!value || typeof value === "boolean") {
      return (
        <Stack key={key} direction="row" gap="2">
          <Text as="span">{key}</Text>
          <input
            type="checkbox"
            checked={value}
            onChange={(event) => {
              const checked = event.target.checked;

              onPreferencesChange({
                workflows: {
                  ...preferences,
                  [key]: checked,
                },
                categories: {},
                channel_types: {},
                channels: {},
              });
            }}
          />
        </Stack>
      );
    }


    if (typeof value === "object" && "channels" in value) {
      return (
        <Stack key={key} direction="column" gap="2">
          <Text as="span">{key}</Text>
          {Object.entries(value.channels).map(
            ([channelId, channelValue]) => {
              if (typeof channelValue !== "boolean") return;

              return (
                <Stack key={channelId} direction="row" gap="2" ml="8">
                  <Text as="span">{channelId}</Text>
                  <input
                    type="checkbox"
                    checked={channelValue}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      onPreferencesChange({
                        workflows: {
                          ...preferences,
                          [key]: {
                            ...value,
                            channels: {
                              ...value.channels,
                              [channelId]: checked,
                            },
                          },
                        },
                        categories: {},
                        channel_types: {},
                        channels: {},
                      });
                    }}
                  />
                </Stack>
              );
            },
          )}
        </Stack>
      );
    }

    if (typeof value === "object" && "channel_types" in value) {
      return (
        <Stack key={key} direction="column" gap="2">
          <Text as="span">{key}</Text>
          {Object.entries(value.channel_types).map(
            ([channelKey, channelValue]) => {
              if (typeof channelValue !== "boolean") return;

              return (
                <Stack key={channelKey} direction="row" gap="2" ml="8">
                  <Text as="span">{channelKey}</Text>
                  <input
                    type="checkbox"
                    checked={channelValue}
                    onChange={(event) => {
                      const checked = event.target.checked;

                      onPreferencesChange({
                        workflows: {
                          ...preferences,
                          [key]: {
                            ...value,
                            channel_types: {
                              ...value.channel_types,
                              [channelKey]: checked,
                            },
                          },
                        },
                        categories: {},
                        channel_types: {},
                        channels: {},
                      });
                    }}
                  />
                </Stack>
              );
            },
          )}
        </Stack>
      );
    }
  });
};

const NotificationPreferences = () => {
  const { preferences, setPreferences } = usePreferences();

  return (
    <Stack border="px" rounded="3" padding="4" direction="column" gap="2">
      <Text as="h1" size="4">
        Notification Preferences
      </Text>
      {preferences?.workflows && (
        <WorkflowPreferences
          preferences={preferences?.workflows}
          onPreferencesChange={setPreferences}
        />
      )}
    </Stack>
  );
};

export { NotificationPreferences };
