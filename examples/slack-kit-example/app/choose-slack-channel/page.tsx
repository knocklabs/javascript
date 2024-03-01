import Link from "next/link";

import SlackChannelWrapper from "../components/slack-channel-wrapper";
import { getAppDetails } from "../lib/app-details";

export default async function Page() {
  const { collection, objectId } = getAppDetails();
  return (
    <>
      <h2 className="text-xl font-bold my-4">Choose a Slack Channel</h2>
      <p className="mb-4">
        In this step, you&apos;ll associate one or more Slack channels with the{" "}
        <code className="text-[#E95744]">{objectId}</code> object in the{" "}
        <code className="text-[#E95744]">{collection}</code> collection. Knock
        will store these Slack channel ids as channel data on your selected
        object.
      </p>
      <p className="mb-4">
        This step uses the{" "}
        <code className="text-[#E95744]">SlackChannelsCombobox</code> component
        to associate public and private channels with your{" "}
        <code className="text-[#E95744]">{objectId}</code> object recipient. You
        can read more about{" "}
        <a
          className="underline text-blue-700"
          href="https://docs.knock.app/managing-recipients/setting-channel-data"
          target="_blank"
        >
          how to use channel data
        </a>{" "}
        in the docs.
      </p>
      <p className="mb-4">
        Use the toggle to optionally show the currently connected Slack channels
        below the combobox (sets the{" "}
        <code className="text-[#E95744]">showConnectedChannelTags</code> prop to{" "}
        <code className="text-[#E95744]">true</code> for the{" "}
        <code className="text-[#E95744]">SlackChannelCombobox</code>).
      </p>
      <SlackChannelWrapper
        className="my-6"
        collection={collection}
        objectId={objectId}
      ></SlackChannelWrapper>
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/initiate-auth"
      >
        Previous
      </Link>
      <a
        className="mt-6 mx-4 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/examine-channel-data"
      >
        Next
      </a>
    </>
  );
}

export const dynamic = "force-dynamic";
