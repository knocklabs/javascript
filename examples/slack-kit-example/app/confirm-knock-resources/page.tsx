import Link from "next/link";

import { getAppDetails } from "../lib/app-details";

export default async function Page() {
  const appDetails = getAppDetails();

  return (
    <>
      <h2 className="text-xl font-bold my-4">Confirm Your Knock Resources</h2>
      <p className="mb-4">
        In this step, we&apos;ll check to make sure you&apos;ve defined all of
        the Knock resources you&apos;ll need to complete this application. If
        you&apos;re missing any variables, please add them to your code in the{" "}
        <code className="text-[#E95744]">/app/lib/app-details.ts</code> file and
        refresh the page.
      </p>
      <p className="mb-4">
        Typically, these values would come from your application&apos;s business
        logic, but for this app we&apos;ll just hardcode them in the{" "}
        <code className="text-[#E95744]">getAppDetails</code> function.
      </p>
      <p className="mt-2 font-medium">
        {appDetails.tenant ? "✅" : "❌"} Knock Tenant Id:{" "}
        <span className="font-normal text-neutral-800">
          {appDetails.tenant}
        </span>
      </p>
      <p className="mt-2 font-medium">
        {appDetails.collection ? "✅" : "❌"} Knock Object Collection:{" "}
        <span className="font-normal text-neutral-800">
          {appDetails.collection}
        </span>
      </p>
      <p className="mt-2 font-medium">
        {appDetails.objectId ? "✅" : "❌"} Knock Object Id:{" "}
        <span className="font-normal text-neutral-800">
          {appDetails.objectId}
        </span>
      </p>
      <p className="mt-2 font-medium">
        {appDetails.userId ? "✅" : "❌"} Knock User Id:{" "}
        <span className="font-normal text-neutral-800">
          {appDetails.userId}
        </span>
      </p>
      <p className="mt-2 font-medium">
        {appDetails.workflowKey ? "✅" : "❌"} Knock Workflow Key:{" "}
        <span className="font-normal text-neutral-800">
          {appDetails.workflowKey}
        </span>
      </p>
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/"
      >
        Previous
      </Link>
      &nbsp;&nbsp;&nbsp;
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/initiate-auth"
      >
        Next
      </Link>
    </>
  );
}
export const dynamic = "force-dynamic";
