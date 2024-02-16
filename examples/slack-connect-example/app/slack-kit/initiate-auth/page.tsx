import Link from "next/link";

import AuthWrapper from "../components/slack-auth-wrapper";
import { getAppDetails, getTenant } from "../lib/knock";

export default async function Page() {
  const { tenant } = await getAppDetails();
  const tenantDetails = await getTenant(tenant);
  return (
    <>
      <h2>Authenticate with Slack</h2>
      <p>
        In this step, you'll authenticate with Slack using OAuth. After
        completing the OAuth flow, Knock will store an <code>access_token</code>{" "}
        property on the channel data for the{" "}
        <code>{tenantDetails.properties.name}</code> tenant.
      </p>
      <p>
        This page uses the <code>SlackAuthButton</code> and{" "}
        <code>SlackAuthContainer</code> components to facilitate the OAuth flow
        between Slack and Knock's API.
      </p>
      <AuthWrapper tenant={tenant}></AuthWrapper>
      <Link href="/slack-kit/confirm-knock-resources">Previous</Link>
      <Link href="/slack-kit/choose-slack-channel">Next</Link>
    </>
  );
}
