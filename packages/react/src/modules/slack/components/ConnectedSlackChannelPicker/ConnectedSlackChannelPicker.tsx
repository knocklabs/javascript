import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";
import {
  ContainerObject,
  useConnectedSlackChannels,
  useKnockSlackClient,
  useSlackChannels,
} from "@knocklabs/react-core";
import { useCallback, useState } from "react";

import SlackChannelOption from "./SlackChannelOption";
import "./styles.css";

type Props = {
  connectionsObject: ContainerObject;
};

export const ConnectedSlackChannelPicker: React.FC<Props> = ({
  connectionsObject,
}) => {
  const { connectionStatus, errorLabel, tenant, knockSlackChannelId } =
    useKnockSlackClient();

  const [showChannelPicker, setShowChannelPicker] = useState(false);

  const { data: slackChannels, isLoading } = useSlackChannels({
    tenant,
    connectionsObject,
    knockSlackChannelId,
    queryOptions: {
      limitPerPage: 200,
    },
  });

  const { data: connectedChannels, updateConnectedChannels } =
    useConnectedSlackChannels({
      connectionsObject,
      knockSlackChannelId,
    });

  const handleOptionClick = async (channelId: string) => {
    if (!connectedChannels) {
      return;
    }

    const isChannelConnected = connectedChannels.find(
      (channel) => channel.channel_id === channelId,
    );

    if (isChannelConnected) {
      const channelsToSendToKnock = connectedChannels.filter(
        (connectedChannel) => connectedChannel.channel_id !== channelId,
      );
      updateConnectedChannels(channelsToSendToKnock);
    } else {
      const channelsToSendToKnock = [
        ...connectedChannels,
        { channel_id: channelId } as SlackChannelConnection,
      ];
      updateConnectedChannels(channelsToSendToKnock);
    }
  };

  const channelsConnectedMessage = useCallback(() => {
    if (connectionStatus === "disconnected") {
      return "Not connected to Slack.";
    }

    if (connectionStatus === "error") {
      return errorLabel;
    }

    if (connectionStatus === "loading" || isLoading) {
      return "Fetching channels...";
    }

    if (slackChannels.length === 0) {
      return "No slack channels.";
    }

    const numberConnectedChannels = connectedChannels?.length;

    if (numberConnectedChannels === 0 || !connectedChannels) {
      return "Select a Slack channel";
    }

    if (numberConnectedChannels === 1) {
      const connectedChannel = slackChannels?.find(
        (slackChannel) => slackChannel.id === connectedChannels[0]?.channel_id,
      );

      return `#${connectedChannel?.name}`;
    }

    return "Multiple channels connected";
  }, [
    connectedChannels,
    connectionStatus,
    errorLabel,
    isLoading,
    slackChannels,
  ]);

  return (
    <div
      style={{
        width: "256px",
      }}
    >
      <div>
        <div className="rnf-multiSelectAccordion">
          <div
            key={"select"}
            className="rnf-header"
            onClick={() => {
              if (connectedChannels) {
                setShowChannelPicker(!showChannelPicker);
              }
            }}
          >
            {channelsConnectedMessage()}

            <span className="rnf-icon">
              {showChannelPicker ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 512 512"
                >
                  <g transform="translate(0 512) scale(1 -1)">
                    <path
                      fill="none"
                      stroke="black"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="48"
                      d="m112 184l144 144l144-144"
                    />
                  </g>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 512 512"
                >
                  <path
                    fill="none"
                    stroke="black"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="48"
                    d="m112 184l144 144l144-144"
                  />
                </svg>
              )}
            </span>
          </div>
        </div>
        {!!showChannelPicker && (
          <div className="rnf-multiSelectAccordion">
            <div className="rnf-optionsContainer">
              {slackChannels?.map((slackChannel: SlackChannel) => (
                <SlackChannelOption
                  key={slackChannel.id}
                  channel={slackChannel}
                  isLoading={isLoading}
                  isConnected={
                    !!connectedChannels?.find(
                      (channel) => channel.channel_id === slackChannel.id,
                    )
                  }
                  onClick={handleOptionClick}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
