"use client";

import { SlackAuthButton, SlackAuthContainer } from "@knocklabs/react";

export default function AuthWrapper() {
  return (
    <div>
      <SlackAuthContainer
        actionButton={
          <SlackAuthButton
            slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
            redirectUrl={"http://localhost:3001/"}
          />
        }
      />
    </div>
  );
}
