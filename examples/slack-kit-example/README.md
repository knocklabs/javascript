This is an example app meant to help you get started using the SlackKit components and APIs provided by Knock.

## Getting started

For this project, there are quite a few configuration variables you need before you can get started. Some of these are typical environment variables you would supply to your application, like API keys, tokens, or client ids.

The other set of values would typically be determined by your product's business logic, but you can hardcode these values for the time being.

### Setting up a Slack app

1. Visit https://api.slack.com/apps and sign into your account.
2. Click "Create new app" and "from scratch"
3. Select which workspace to develop it in. You'll still be able to use it in other workspaces.
4. Under "Add features and functionality" select “Bots” features
5. Under "OAuth and Permissions", give it `channels:read` scope (it doesn’t really need any scope here since we’ll be sending scopes we need from the component, but we need the user to do this so we can expose the redirect url form.)
6. Also under "OAuth and Permissions", add this Knock URL to that field:https://api.knock.app/providers/slack/authenticate. Knock's API endpoint will handle the OAuth callback for you.
7. Under "Manage distribution", allow it to be publicly distributed

### Environment variables

All of these values are sourced from environment variables. The example app will check for these values as the first step. Make a copy of `.env.sample` using the following command: `cp .env.sample .env.local`

| Env Var                            | Description                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID | This value comes from Knock after you create a Slack channel in the dashboard.                                                                                                                                                                                                                |
| NEXT_PUBLIC_SLACK_CLIENT_ID        | This value comes from Slack when you create a new Slack app. You can find it in your app's 'Basic Info' section.                                                                                                                                                                              |
| KNOCK_SIGNING_KEY                  | This value comes from Knock and is used to sign a JWT on behalf of a user to store channel data for Slack tokens and channel ids. You can generate a signing key under "Developers" > "API keys." Use the PEM encoded version. **This is a secret value and should not be exposed publicly.** |
| KNOCK_API_KEY                      | This value comes from Knock and is used to authenticate server-side API requests. You can find it listed as the secret key under "Developers" > "API keys." **This is a secret value and should not be exposed publicly.**                                                                    |
| NEXT_PUBLIC_KNOCK_CLIENT_ID        | This value comes from Knock and is used to authenticate public API requests from the browser. You can find it listed as the public key under "Developers" > "API keys."                                                                                                                       |
| NEXT_PUBLIC_KNOCK_API_URL          | This value comes from Knock and is used to construct the URL for API endpoints                                                                                                                                                                                                                |
| NEXT_PUBLIC_REDIRECT_URL           | This value comes from your application. It is where Knock will redirect your user after the OAuth flow with Slack. The default of `http://localhost:3000` is valid when running this project locally.                                                                                         |

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
