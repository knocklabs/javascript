import Link from "next/link";

import AuthWrapper from "../components/slack-auth-wrapper";
import { getAppDetails } from "../lib/app-details";

export default async function Page() {
  const { tenant } = getAppDetails();

  return (
    <>
      <h2>Authenticate with Slack</h2>
      <p>
        In this step, you&apos;ll authenticate with Slack using OAuth. After
        completing the OAuth flow, Knock will store an <code>access_token</code>{" "}
        property on the channel data for the <code>{tenant}</code> tenant.
      </p>
      <p>
        This page uses the <code>SlackAuthButton</code> and{" "}
        <code>SlackAuthContainer</code> components to facilitate the OAuth flow
        between Slack and Knock's API.
      </p>
      <AuthWrapper></AuthWrapper>
      <Link href="/slack-kit/confirm-knock-resources">Previous</Link>
      <Link href="/slack-kit/choose-slack-channel">Next</Link>
    </>
  );
}
export const dynamic = "force-dynamic";
