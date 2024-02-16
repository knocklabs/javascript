import Link from "next/link";

import { getAppDetails } from "../lib/knock";

export default async function Page() {
  const appDetails = getAppDetails();

  return (
    <>
      <h2>Confirm Your Knock Resources</h2>
      <p>
        In this step, we'll check to make sure you've defined all of the Knock
        resources you'll need to complete this application. If you're missing
        any variables, please add them to your code in the{" "}
        <code>/app/lib/knock.ts</code> file and refresh the page.
      </p>
      <p>
        Typically, these values would come from your application's business
        logic, but for this app we'll just hardcode them in the{" "}
        <code>getAppDetails</code> function.
      </p>
      <p>
        {appDetails.tenant ? "✅" : "❌"} Knock Tenant Id: {appDetails.tenant}
      </p>
      <p>
        {appDetails.collection ? "✅" : "❌"} Knock Object Collection:{" "}
        {appDetails.collection}
      </p>
      <p>
        {appDetails.objectId ? "✅" : "❌"} Knock Object Id:{" "}
        {appDetails.objectId}
      </p>
      <p>
        {appDetails.userId ? "✅" : "❌"} Knock User Id: {appDetails.userId}
      </p>
      <p>
        {appDetails.workflowKey ? "✅" : "❌"} Knock Workflow Key:{" "}
        {appDetails.workflowKey}
      </p>
      <Link href="/slack-kit">Previous</Link>|
      <Link href="/slack-kit/initiate-auth">Next</Link>
    </>
  );
}
