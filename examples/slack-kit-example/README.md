This is an example app meant to help you get started using the SlackKit components and APIs provided by Knock.

## Getting Started

For this project, there are quite a few configuration variables you need before you can get started. Some of these are typical environment variables you would supply to your application, like API keys, tokens, or client ids.

The other set of values would typically be determined by your product's business logic, but you can hardcode these values for the time being.

### Environment Variables

All of these values are sourced from environment variables. The example app will check for these values as the first step.

| Env Var                            | Description                                                                                                                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID | This value comes from Knock after you create a Slack channel.                                                                                                                                |
| NEXT_PUBLIC_SLACK_CLIENT_ID        | This value comes from Slack when you create a new Slack app.                                                                                                                                 |
| KNOCK_SIGNING_KEY                  | This value comes from Knock and is used to sign a JWT on behalf of a user to store channel data for Slack tokens and channel ids. This is a secret value and should not be exposed publicly. |
| KNOCK_API_KEY                      | This value comes from Knock and is used to authenticate server-side API requests. This is a secret value and should not be exposed publicly.                                                 |
| NEXT_PUBLIC_KNOCK_CLIENT_ID        | This value comes from Knock and is used to authenticate public API requests from the browser.                                                                                                |
| NEXT_PUBLIC_KNOCK_API_URL          | This value comes from Knock and is used to construct the URL for API endpoints                                                                                                               |
| NEXT_PUBLIC_REDIRECT_URL           | This value comes from your application. It is where Knock will redirect your user to after the OAuth flow with Slack.                                                                        |

### Knock Resource Variables

To make the connection to Slack channels and Knock objects, you'll also need to provide ids for several types of resources in Knock. To do this, you can replace the values in the `getAppDetails` function inside of the `/app/lib/app-details.ts` file. That function looks like this:

```
// TODO:Add your app details
// This function returns some values that would normally be determined
// by your application's business logic. We're hardcoding them for convenience

export function getAppDetails() {
  return {
    tenant: "knock-projects",
    collection: "repositories",
    objectId: "repo-2",
    userId: "123",
    workflowKey: "new-issue",
    redirectUrl: "http://localhost:3000",
  };
}
```
