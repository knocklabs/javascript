"use client";

import { SlackAuthButton, SlackAuthContainer } from "@knocklabs/react";

import { getAppDetails } from "../lib/app-details";

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
