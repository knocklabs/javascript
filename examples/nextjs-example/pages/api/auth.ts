import { Knock } from "@knocklabs/node";
import { v4 as uuidv4 } from "uuid";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .setHeader("Allow", "GET")
      .json({ error: `${req.method} method is not accepted.` });
  }

  const { id } = req.query;
  const userId = (id as string) || uuidv4();

  try {
    const userToken = await Knock.signUserToken(userId, {
      expiresInSeconds: process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS
        ? Number(process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS)
        : 3600,
    });

    return res.status(200).json({ error: null, userToken });
  } catch (error) {
    return res.status(500).json({
      error: (error as Error).message || (error as Error).toString(),
      user: null,
    });
  }
}
