/* eslint-disable turbo/no-undeclared-env-vars */
"use client";

import { SlackAuthButton, SlackAuthContainer } from "@knocklabs/react";

export default function AuthWrapper() {
  const onAuthComplete = (result: string) => {
    console.log("Result from Slack/Knock authentication:", result)
	};

	return (
		<div>
			<SlackAuthContainer
				actionButton={
					<SlackAuthButton
						slackClientId={process.env.NEXT_PUBLIC_SLACK_CLIENT_ID!}
						redirectUrl={process.env.NEXT_PUBLIC_REDIRECT_URL}
						onAuthenticationComplete={onAuthComplete}
					/>
				}
			/>
		</div>
	);
}
