"use client";

import {
  ConnectToSlackButton,
  ConnectToSlackContainer,
} from "@knocklabs/react";

export default function AuthWrapper({ tenant }: { tenant: string }) {
  return (
    <div>
      <ConnectToSlackContainer
        actionButton={
          <ConnectToSlackButton
            slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
            redirectUrl={"http://localhost:3001/"}
          />
        }
      />
    </div>
  );
}
