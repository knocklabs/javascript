import Link from "next/link";

import { getAppDetails } from "../lib/app-details";
import { triggerWorkflow } from "../lib/knock";

export default async function Page() {
  const { workflowKey, collection, objectId, tenant } = getAppDetails();
  return (
    <>
      <h2>Trigger a Workflow</h2>
      <p>
        Now that you have a good understanding of how the SlackKit components
        work with Knock primitives like Objects and Tenants, let&apos;s actually
        send a message.
      </p>
      <p>
        Under the hood, we&apos;ll call a server action that&apos;s going to run
        this code using the values you provided:
      </p>
      <pre>
        {`
  await knockClient.workflows.trigger(${workflowKey}, {
    recipients: [
      {
        collection: ${collection},
        id: ${objectId},
      },
    ],
    tenant: ${tenant},
    data: {
      message: formData.get("message"),
    },
  });
          `}
      </pre>
      <p>
        As you can see, you pass the Object storing the Slack{" "}
        <code>channel_id</code> as a recipient and specify the tenant with the{" "}
        <code>access_token</code> using the <code>tenant</code> option.
      </p>
      <p>Go ahead and submit the form below to test your Slack integration.</p>

      <form
        action={async (formData: FormData) => {
          "use server";
          console.log("getting called");
          await triggerWorkflow(formData);
        }}
      >
        <textarea name="message" id="" cols={30} rows={10}></textarea>
        <button type="submit">Trigger Workflow</button>
      </form>
      <Link href="/examine-channel-data">Previous</Link>
    </>
  );
}

export const dynamic = "force-dynamic";
