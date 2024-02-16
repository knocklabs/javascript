import Link from "next/link";

import { getAppDetails } from "../lib/app-details";
import { triggerWorkflow } from "../lib/knock";

export default async function Page() {
  const { workflowKey, collection, objectId, tenant } = getAppDetails();
  return (
    <>
      <h2 className="text-xl font-bold my-4">Trigger a Workflow</h2>
      <p className="mb-4">
        Now that you have a good understanding of how the SlackKit components
        work with Knock primitives like Objects and Tenants, let&apos;s actually
        send a message.
      </p>
      <p className="mb-4">
        Under the hood, we&apos;ll call a server action that&apos;s going to run
        this code using the values you provided:
      </p>
      <pre className="text-xs bg-zinc-900 text-white rounded-md">
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
      <p className="my-4">
        As you can see, you pass the Object storing the Slack{" "}
        <code className="text-[#E95744]">channel_id</code> as a recipient and
        specify the tenant with the{" "}
        <code className="text-[#E95744]">access_token</code> using the{" "}
        <code className="text-[#E95744]">tenant</code> option.
      </p>
      <p className="mb-4">
        Go ahead and submit the form below to test your Slack integration.
      </p>

      <form
        className="block"
        action={async (formData: FormData) => {
          "use server";
          await triggerWorkflow(formData);
        }}
      >
        <textarea name="message" id="" cols={30} rows={10}></textarea>
        <button
          className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
          type="submit"
        >
          Trigger Workflow
        </button>
      </form>
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/examine-channel-data"
      >
        Previous
      </Link>
    </>
  );
}

export const dynamic = "force-dynamic";
