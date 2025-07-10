import Knock from "@knocklabs/node";

const knockClient = new Knock({
  apiKey: process.env.KNOCK_SECRET_API_KEY,
  baseURL: process.env.NEXT_PUBLIC_KNOCK_HOST,
});

const KNOCK_WORKFLOW = process.env.NEXT_PUBLIC_WORKFLOW_KEY!;

export const POST = async (request: Request) => {
  const { message, showToast, userId, tenant, templateType } =
    await request.json();

  try {
    const response = await knockClient.workflows.trigger(KNOCK_WORKFLOW, {
      recipients: [userId],
      // Actor is not required for the workflow to trigger.
      // We leave this commented out for the demo, because
      // if the actor's userId === the only recipient userId, the workflow won't be triggered.
      // Use this field if you want to specify a different actor for the workflow.
      // actor: userId,
      tenant,
      data: {
        message,
        showToast,
        templateType,
      },
    });

    return new Response(JSON.stringify({ error: null, response }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: (error as Error).message || (error as Error).toString(),
        user: null,
      }),
      {
        status: 500,
      },
    );
  }
};
