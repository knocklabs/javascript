import { faker } from "@faker-js/faker";
import Knock from "@knocklabs/node";
import { signUserToken } from "@knocklabs/node/lib/tokenSigner";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";

const knockClient = new Knock({
  apiKey: process.env.KNOCK_SECRET_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_KNOCK_HOST,
});

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

  const { id } = req.body;
  const userId = id || uuidv4();

  try {
    const knockUser = await knockClient.users.update(userId, {
      // Create a user for the demo, we'll only set the name if we don't have a user yet
      name: id ? undefined : faker.person.fullName(),
    });

    let userToken = undefined;

    if (process.env.KNOCK_SIGNING_KEY) {
      userToken = await signUserToken(userId, {
        expiresInSeconds: process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS
          ? Number(process.env.KNOCK_TOKEN_EXPIRES_IN_SECONDS)
          : 3600,
      });
    }

    return res.status(200).json({ error: null, user: knockUser, userToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: (error as Error).message || (error as Error).toString(),
      user: null,
    });
  }
}
