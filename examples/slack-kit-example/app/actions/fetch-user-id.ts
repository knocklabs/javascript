"use server";

import { Knock } from "@knocklabs/node";

import { getAppDetails } from "../lib/app-details";

const knockApiKey = process.env.KNOCK_API_KEY;
const knock = new Knock(knockApiKey);
const appDetails = getAppDetails();

export async function fetchUserId(email: string): Promise<string> {
  const channelData = await getKnockChannelData();
  const response = await fetch(
    `https://slack.com/api/users.lookupByEmail?email=${email}`,
    {
      headers: {
        Authorization: `Bearer ${channelData.data.token.access_token}`,
      },
    },
  );
  const data = await response.json();
  if (data.ok) {
    await setKnockChannelData(appDetails.userId, data.user.id);
  }
  return data;
}

async function getKnockChannelData(): Promise<any> {
  try {
    const channelData = await knock.objects.getChannelData(
      "$tenants",
      appDetails.tenant,
      process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID as string,
    );
    return channelData;
  } catch (error) {
    console.error("Error fetching Knock channel data:", error);
    throw error;
  }
}

async function setKnockChannelData(
  userId: string,
  slackUserId: string,
): Promise<void> {
  try {
    const userChannelData = await knock.users.setChannelData(
      userId,
      process.env.NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID as string,
      {
        connections: [{ user_id: slackUserId }],
      },
    );

    console.log(`Channel data set for user ${userId}`);
  } catch (error) {
    console.error("Error setting Knock channel data:", error);
    throw error;
  }
}
