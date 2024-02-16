import Link from "next/link";

import {
  getAppDetails,
  getChannelData,
  getObject,
  getTenant,
} from "../lib/knock";

export default async function Page() {
  const { tenant, collection, objectId } = await getAppDetails();
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
      <h2>Confirm Channel Data</h2>
      <p>
        In this step, we'll look at how Knock stores you Slack{" "}
        <code>access_token</code> and Slack channel connections as channel data
        on the <code>{tenant}</code> tenant and <code>{objectId}</code> object
        recipient.{" "}
      </p>
      <p>
        We've fetched this channel data for you from the resources you
        designated in the app.
      </p>

      <h3>Tenant</h3>
      <p>
        Your designated tenant stores your Slack bot's <code>access_token</code>{" "}
        as channel data. When you trigger a workflow and pass{" "}
        <code>{tenant}</code> for the <code>tenant</code> property, Slack
        channel steps will use this token for any Slack messages.{" "}
      </p>
      <pre style={{ maxWidth: "800px" }}>
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
      <h3>Object Recipient</h3>
      <p>
        Your object recipient stores the <code>channel_id</code> inside an
        object on the <code>connections</code> array. When <code>objectId</code>{" "}
        is passed as a workflow recipient, Knock will generate a Slack
        notification for each connection in the <code>connections</code> array.
      </p>
      <pre>
        {`
{
  "__typename": "ChannelData",
  "channel_id": ${objectRecipientChannelData.channel_id},
  "data": {
    "connections": [
      ${objectRecipientChannelData.data.connections.map((connection: object) => JSON.stringify(connection)).join(",/n")}  
    ],
    "token": ${objectRecipientChannelData.data.token}
  }
}
        `}
      </pre>
      <Link href="/slack-kit/choose-slack-channel">Previous</Link>
      <Link href="/slack-kit/trigger-workflow">Next</Link>
    </>
  );
}
