This is an example app meant to help you get started using the SlackKit components and APIs provided by Knock.

## Getting Started

For this project, there are quite a bit of configuration variables you need before you can get started. Some of these are typical environment variables you would supply to your application, like API keys, tokens, or client ids. The other set of values would typically be determined by your product's business logic, but you can hardcode these values for the time being.

### Environment Variables

All of these values are sourced from environment variables. The example app will check for these values as the first step.

NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID
NEXT_PUBLIC_SLACK_CLIENT_ID
KNOCK_SIGNING_KEY
KNOCK_API_KEY
NEXT_PUBLIC_KNOCK_CLIENT_ID
NEXT_PUBLIC_KNOCK_API_URL

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
