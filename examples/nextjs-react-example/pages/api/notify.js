import { Knock } from "@knocklabs/node";

const knockClient = new Knock(process.env.KNOCK_SECRET_API_KEY);

const KNOCK_WORKFLOW = "in-app";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .setHeader("Allow", "POST")
      .json({ error: `${req.method} method is not accepted.` });
  }

  const { message, showToast, userId, tenant } = req.body;

  try {
    await knockClient.workflows.trigger(KNOCK_WORKFLOW, {
      recipients: [userId],
      actor: userId,
      tenant: tenant,
      data: {
        message,
        showToast,
      },
    });

    return res.status(200).json({ error: null });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || error.toString(), user: null });
  }
}
