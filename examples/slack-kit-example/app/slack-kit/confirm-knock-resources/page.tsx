import Link from "next/link";

import { getAppDetails } from "../lib/knock";

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const appDetails = getAppDetails();

  return (
    <>
      <h2>Confirm Your Knock Resources</h2>
      <p>
        In this step, we&apos;ll check to make sure you've defined all of the
        Knock resources you&apos;ll need to complete this application. If
        you&apos;re missing any variables, please add them to your code in the{" "}
        <code>/app/lib/knock.ts</code> file and refresh the page.
      </p>
      <p>
        Typically, these values would come from your application&apos;s business
        logic, but for this app we&apos;ll just hardcode them in the{" "}
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
export const dynamic = "force-dynamic";
