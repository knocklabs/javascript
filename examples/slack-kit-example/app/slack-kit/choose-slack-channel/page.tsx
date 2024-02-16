import Link from "next/link";

import SlackChannelWrapper from "../components/slack-channel-wrapper";
import { getAppDetails } from "../lib/knock";

export default async function Page() {
  const { collection, objectId } = getAppDetails();
  return (
    <>
      <h2>Choose a Slack Channel</h2>
      <p>
        In this step, you&apos;ll associate one or more Slack channels with the{" "}
        <code>{objectId}</code> object in the <code>{collection}</code>{" "}
        collection. Knock will store these Slack channel ids as channel data on
        your selected object.
      </p>
      <p>
        This step uses the <code>SlackChannelsCombobox</code> component to
        associate public and private channels with your <code>{objectId}</code>{" "}
        object recipient. You can read more about{" "}
        <a
          href="https://docs.knock.app/managing-recipients/setting-channel-data"
          target="_blank"
        >
          how to use channel data
        </a>{" "}
        in the docs.
      </p>
      <SlackChannelWrapper
        collection={collection}
        objectId={objectId}
      ></SlackChannelWrapper>
      <Link href="/slack-kit/initiate-auth">Previous</Link>
      <Link href="/slack-kit/examine-channel-data">Next</Link>
    </>
  );
}
