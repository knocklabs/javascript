import { SlackChannel, SlackChannelConnection } from "@knocklabs/client";

import SlackConnectedChannelTag from "./SlackConnectedChannelTag";
import "./styles.css";

type Props = {
	connectedChannels: SlackChannelConnection[] | null;
	slackChannels: SlackChannel[];
	updateConnectedChannels: (channelId: string) => void;
}

const SlackConnectedChannelTagList = ({
	connectedChannels,
	slackChannels,
	updateConnectedChannels,
}: Props) => {
	const connectedChannelsMap = new Map(
		connectedChannels?.map((channel) => [channel.channel_id, channel]),
	);

	const channels =
		slackChannels?.filter((slackChannel) => {
			return connectedChannelsMap.has(slackChannel.id || "");
		}) || [];

	return (
		<div className="rsk-combobox__connected_channel_tag_list">
			{channels.map((channel) => (
				<SlackConnectedChannelTag key={channel.id} channel={channel} updateConnectedChannels={updateConnectedChannels} />
			))}
		</div>
	);
};

export default SlackConnectedChannelTagList;
