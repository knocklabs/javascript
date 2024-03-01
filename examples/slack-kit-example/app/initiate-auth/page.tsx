import Link from "next/link";

import AuthWrapper from "../components/slack-auth-wrapper";
import { getAppDetails } from "../lib/app-details";

export default async function Page() {
  const { tenant } = getAppDetails();

  return (
    <>
      <h2 className="text-xl font-bold my-4">Authenticate with Slack</h2>
      <p className="mb-4">
        In this step, you&apos;ll authenticate with Slack using OAuth. After
        completing the OAuth flow, Knock will store an{" "}
        <code className="text-[#E95744]">access_token</code> property on the
        channel data for the <code className="text-[#E95744]">{tenant}</code>{" "}
        tenant.
      </p>
      <p className="mb-4">
        This page uses the{" "}
        <code className="text-[#E95744]">SlackAuthButton</code> and{" "}
        <code className="text-[#E95744]">SlackAuthContainer</code> components to
        facilitate the OAuth flow between Slack and Knock's API.
      </p>
      <p className="mb-4">
        You can use the optional{" "}
        <code className="text-[#E95744]">onAuthenticationComplete</code> callback{" "}
        to pass a custom function to the <code className="text-[#E95744]">SlackAuthButton</code> {" "}
        that will run when it finishes a successful or failed authentication. In this code, we've passed
        a custom function that will console.log the authentication result.
      </p>
      <AuthWrapper></AuthWrapper>
      <Link
        className="mt-6 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/confirm-knock-resources"
      >
        Previous
      </Link>
      <Link
        className="mt-6 mx-4 inline-block bg-[#E95744] text-white p-2 rounded-md hover:bg-[#E64733]"
        href="/choose-slack-channel"
      >
        Next
      </Link>
    </>
  );
}
export const dynamic = "force-dynamic";
