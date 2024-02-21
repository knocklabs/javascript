This is an example app meant to help you get started using the SlackKit components and APIs provided by Knock.

## Getting started

For this project, there are quite a few configuration variables you need before you can get started. Some of these are typical environment variables you would supply to your application, like API keys, tokens, or client ids.

The other set of values would typically be determined by your product's business logic, but you can hardcode these values for the time being.

### Setting up a Slack app

#### Create a new app

First, visit https://api.slack.com/apps and sign into your account. Then click `Create new app` and select the `from scratch` option. Next, select which workspace to develop it in. You'll still be able to use it in other workspaces, so this selection isn't critical.

#### Add bots features

Under `Add features and functionality` select `Bots` features. Then, under `OAuth and Permissions`, give it `channels:read` scope. It doesn’t really need any scopes here since we’ll be sending scopes we need from the component, but we need to do this so we can expose the redirect url form.

#### Add redirect URL

Also under `OAuth and Permissions`, find the redirect URL section and add this Knock URL to that field: https://api.knock.app/providers/slack/authenticate. Knock's API endpoint will handle the OAuth callback for you. Finally, Under `Manage distribution`, allow it to be publicly distributed

### Setting up Knock

#### Create a Slack channel

Add a Slack channel with the `Client Id` and `Client Secret` from the `Basic Info` section of your Slack. Take note of this channel id for use in the next step.

#### Create a new workflow

Create a new [workflow](https://docs.knock.app/concepts/workflows) with a Slack channel step pointing to this Slack channel. Take note of this workflow key for use in the following steps.In the message template use the following liquid tag to test your ability to send messages: `A new issue was submitted: {{message}}`

### Environment variables

All of these values are sourced from environment variables at runtime. The example app will check for these values as the first step. Make a copy of `.env.sample` using the following command: `cp .env.sample .env.local`

| Env Var                            | Description                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID | This value comes from Knock after you create a Slack channel in the dashboard.                                                                                                                                                                                                                |
| NEXT_PUBLIC_SLACK_CLIENT_ID        | This value comes from Slack when you create a new Slack app. You can find it in your app's 'Basic Info' section.                                                                                                                                                                              |
| KNOCK_SIGNING_KEY                  | This value comes from Knock and is used to sign a JWT on behalf of a user to store channel data for Slack tokens and channel ids. You can generate a signing key under "Developers" > "API keys." Use the PEM encoded version. **This is a secret value and should not be exposed publicly.** |
| KNOCK_API_KEY                      | This value comes from Knock and is used to authenticate server-side API requests. You can find it listed as the secret key under "Developers" > "API keys." **This is a secret value and should not be exposed publicly.**                                                                    |
| NEXT_PUBLIC_KNOCK_CLIENT_ID        | This value comes from Knock and is used to authenticate public API requests from the browser. You can find it listed as the public key under "Developers" > "API keys."                                                                                                                       |
| NEXT_PUBLIC_KNOCK_API_URL          | This value comes from Knock and is used to construct the URL for API endpoints                                                                                                                                                                                                                |
| NEXT_PUBLIC_REDIRECT_URL           | This value comes from your application. It is where Knock will redirect your user after the OAuth flow with Slack. The default of `http://localhost:3000` is valid when running this project locally.                                                                                         |

### Knock resource variables

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
  };
}
```

You should already have a value for `workflowKey` from a previous step, and you can choose a [user identifier](https://docs.knock.app/concepts/users#user-identifiers) to use from the dashboard.

#### Create a tenant

In Knock, [tenants](https://docs.knock.app/concepts/tenants) are an important concept, and with SlackKit they are used to store the access token for an organization's Slack workspace. You can create a new tenant from the dashboard and include it's ID as the value for the `tenant` property in the `getAppDetails` function. You can also use this CURL command to create a tenant by replacing the values for `tenant-id`, `KNOCK_API_KEY`, and `tenant-name`:

```
curl --location --request PUT 'https://api.knock.app/v1/tenants/<tenant-id>' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <KNOCK_API_KEY>' \
--data '{
  "name": "<tenant-name>",
}'
```

#### Create an object

In Knock, [objects](https://docs.knock.app/concepts/objects) are flexible abstractions, and with SlackKit they are used to store channels and act as the recipient of your workflows. You can't create a new object from the dashboard, so you can use this cURL command to create an object by replacing the values for `object-collection`, `object-id`, `KNOCK_API_KEY`, and `object-name`:

```
curl --location --request PUT 'https://api.knock.app/v1/objects/<object-collection>/<object-id>' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer <KNOCK_API_KEY>' \
--data '{
    "name": "<object-name>"
}'
```

Once you've done that, update the values in the `getAppDetails` function to point to your new object.

## Running the app locally

Now that you have all of the configuration out of the way, you can install your dependencies using one of the following commands:

```
npm install
//or
yarn install
```

After your dependencies have installed, you can run the app in dev mode:

```
npm run dev
//or
yarn dev
```
