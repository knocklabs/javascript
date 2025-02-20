import { Knock } from "@knocklabs/node";
import { NextApiRequest, NextApiResponse } from "next";

const knockClient = new Knock(process.env.KNOCK_SECRET_API_KEY, {
  host: process.env.NEXT_PUBLIC_KNOCK_HOST,
});

const KNOCK_WORKFLOW = "react-sdk-upgrade-test";

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

  const { message, showToast, userId, tenant, templateType } = req.body;

  try {
    const response = await knockClient.workflows.trigger(KNOCK_WORKFLOW, {
      recipients: [userId],
      // actor: userId,
      actor: "d47f3c00-0a13-4802-91de-a448c907a202",
      // tenant,
      data: {
        message,
        showToast,
        templateType,
      },
    });

    return res.status(200).json({ error: null, response });
  } catch (error) {
    return res.status(500).json({
      error: (error as Error).message || (error as Error).toString(),
      user: null,
    });
  }
}
