/* eslint-disable turbo/no-undeclared-env-vars */
"use client";

import { SlackAuthButton, SlackAuthContainer } from "@knocklabs/react";

/* eslint-disable turbo/no-undeclared-env-vars */

export default function AuthWrapper() {
  return (
    <div>
      <SlackAuthContainer
        actionButton={
          <SlackAuthButton
            slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
            redirectUrl={process.env.NEXT_PUBLIC_REDIRECT_URL}
          />
        }
      />
    </div>
  );
}
