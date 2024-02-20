import jwt from "jsonwebtoken";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .setHeader("Allow", "POST")
      .json({ error: `${req.method} method is not accepted.` });
  }

  const { tenant, user, slackChannelsRecipientObject } = req.body;
  try {
    const signingKey = process.env.KNOCK_SIGNING_KEY!;

    // JWT NumericDates specified in seconds:
    const currentTime = Math.floor(Date.now() / 1000);

    // Default to 1 hour from now
    const expireInSeconds = 60 * 60;

    const token = jwt.sign(
      {
        sub: user.id.toString(),
        iat: currentTime,
        exp: currentTime + expireInSeconds,
        grants: {
          [`https://api.knock.app/v1/objects/$tenants/${tenant}`]: {
            "slack/channels_read": [{}],
          },
          [`https://api.knock.app/v1/objects/${slackChannelsRecipientObject.collection}/${slackChannelsRecipientObject.objectId}`]:
            {
              "channel_data/read": [{}],
              "channel_data/write": [{}],
            },
        },
      },
      signingKey,
      {
        algorithm: "RS256",
      },
    );

    return res.status(200).json({ error: null, token });
  } catch (error) {
    return res.status(500).json({
      error: (error as Error).message || (error as Error).toString(),
      user: null,
    });
  }
}
