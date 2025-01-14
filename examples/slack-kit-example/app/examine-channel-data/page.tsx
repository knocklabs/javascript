import Link from "next/link";

import { getAppDetails } from "../lib/app-details";
import { getChannelData } from "../lib/knock";

export default async function Page() {
  const { tenant, collection, objectId } = getAppDetails();
  const objectRecipientChannelData = await getChannelData(
    collection,
    objectId,
    process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID as string,
  );
  const tenantChannelData = await getChannelData(
    "$tenants",
    tenant,
    process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID as string,
  );
  return (
    <>
      <h2 className="text-xl font-bold my-4">Confirm Channel Data</h2>
      <p className="mb-4">
        In this step, we&apos;ll look at how Knock stores your Slack{" "}
        <code className="text-[#E95744]">access_token</code> and Slack channel
        connections as channel data on the{" "}
        <code className="text-[#E95744]">{tenant}</code> tenant and{" "}
        <code className="text-[#E95744]">{objectId}</code> object recipient.{" "}
      </p>
      <p className="mb-4">
        We&apos;ve fetched this channel data for you from the resources you
        designated in the app.
      </p>

      <h3 className="text-lg font-bold my-4">Tenant</h3>
      <p className="mb-4">
        Your designated tenant stores your Slack bot&apos;s{" "}
        <code className="text-[#E95744]">access_token</code> as channel data.
        When you trigger a workflow and pass{" "}
        <code className="text-[#E95744]">{tenant}</code> for the{" "}
        <code className="text-[#E95744]">tenant</code> property, Slack channel
        steps will use this token for any Slack messages.{" "}
      </p>
      <pre className="text-xs p-2 bg-zinc-900 text-white rounded-md">
        {`
{
  "__typename": "ChannelData",
  "channel_id": ${tenantChannelData.channel_id},
  "data": {
    "connections": ${JSON.stringify(tenantChannelData.data.connections)},
    "token": {
      "access_token": ${tenantChannelData.data.token.access_token}
    }
  }
}
        `}
      </pre>
      <h3 className="text-lg font-bold my-4">Object Recipient</h3>
      <p className="mb-4">
        Your object recipient stores the{" "}
        <code className="text-[#E95744]">channel_id</code> inside an object on
        the <code className="text-[#E95744]">connections</code> array. When{" "}
        <code className="text-[#E95744]">{objectId}</code> is passed as a
        workflow recipient, Knock will generate a Slack notification for each
        connection in the <code className="text-[#E95744]">connections</code>{" "}
        array.
      </p>
      <pre className="text-xs p-2 bg-zinc-900 text-white rounded-md">
        {`
{
  "__typename": "ChannelData",
  "channel_id": ${objectRecipientChannelData.channel_id},
  "data": {
    "connections": [
      ${objectRecipientChannelData.data.connections.map(
        (connection: {
          access_token: any;
          channel_id: any;
          incoming_webhook: any;
          user_id: any;
        }) => {
          return `
          {
            "access_token": ${connection.access_token},
            "channel_id": ${connection.channel_id},
            "incoming_webhook": ${connection.incoming_webhook},
            "user_id": ${connection.user_id}
          }`;
        },
      )}  
    ],
    "token": ${objectRecipientChannelData.data.token}
  }
}
        `}
      </pre>
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/choose-slack-channel"
      >
        Previous
      </Link>
      <Link
        className="mt-6 mx-4 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/trigger-workflow"
      >
        Next
      </Link>
    </>
  );
}

export const dynamic = "force-dynamic";
