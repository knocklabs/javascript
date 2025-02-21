import { Knock } from "@knocklabs/node";
import { NextApiRequest, NextApiResponse } from "next";

const knockClient = new Knock(process.env.KNOCK_SECRET_API_KEY, {
  host: process.env.NEXT_PUBLIC_KNOCK_HOST,
});

const KNOCK_WORKFLOW = process.env.NEXT_PUBLIC_WORKFLOW_KEY!;

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
      // Actor is not required for the workflow to trigger.
      // If the actor's userId matches the recipient userId, workflow won't be triggered.
      // Use this field if you want to specify a different actor for the workflow.
      // actor: userId,
      tenant,
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
