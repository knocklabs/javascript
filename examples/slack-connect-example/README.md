This is a demo application to showcase the Slack connector components and Slack channel picker component.

You'll also see how to create a user token with the proper access grants in `/set_token.ts`.

## Setting up a Slackbot

1. Visit https://api.slack.com/apps and sign into your account.
2. Click "Create new app" and "from scratch"
3. Select which workspace to develop it in. You'll still be able to use it in other workspaces.
4. Under "Add features and functionality" select “Bots” features
5. Under "OAuth and Permissions", give it `channels:read` scope (it doesn’t really need any scope here since we’ll be sending scopes we need from the component, but we need the user to do this so we can expose the redirect url form.)
6. Also under "OAuth and Permissions", add a redirect URL to Knock (https://api.knock.app/providers/slack/authenticate)
7. Under "Manage distribution", allow it to be publicly distributed

## Setting up Knock

1. Add a Slack channel with the "client id" and "client secret" from "Basic Info" in your Slackbot.
2. Add a workflow with a Slack channel step pointing to this Slack channel.

## Setting environment variables

Note: you don't have to pre-create the tenant or connections object in Knock for this to work.

### Knock keys

- `NEXT_PUBLIC_KNOCK_API_URL`: https://api.knock.app - should stay the same
- `NEXT_PUBLIC_KNOCK_CLIENT_ID`: the public key under "Developers" > "API keys"
- `KNOCK_API_KEY`: the secret key under "Developers" > "API keys"
- `KNOCK_SIGNING_KEY`: generate a signing key under "Developers" > "API keys"

### Knock entities

- `NEXT_PUBLIC_TENANT`: the ID of the tenant you want to use for holding the Slack access token
- `NEXT_PUBLIC_CONNECTIONS_COLLECTION`: the collection of the object that will store the slack channel connections (i.e. "projects")
- `NEXT_PUBLIC_CONNECTIONS_OBJECT_ID`: the id of the object that will store the slack channel connections (i.e. "projects")

### Slack notification configuration

- `NEXT_PUBLIC_SLACK_CLIENT_ID`: in your Slack app under "basic info"
- `NEXT_PUBLIC_KNOCK_SLACK_CHANNEL_ID`: in the Knock dashboard on the Slack channel
- `NEXT_PUBLIC_REDIRECT_URL`: set this to http://localhost:3000/ if running locally

## Running this application

1. Run the development server:

   ```bash
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) with your browser.
3. Use one of the "Connect to Slack" buttons to authorize Knock to communicate with your Slack workspace.
4. After this is successfully completed, you can check your Knock dashboard to see the tenant you chose populated with an access token under its channel data.
5. Your channel picker should now be able to load a list of channels from the Slack workspace you authorized. Click a channel to connect/disconnect it.
6. Once you select a channel, you can check your Knock dashboard to see the connections object populated with the Slack channel connection data.
7. Trigger your workflow you set up with this Slack channel step with the connections object as the recipient and the tenant you set up. You should see the channel(s) you selected populate with a slack message.

Example payload:

```json
{
  "recipients": [
    {
      "id": "connections-object",
      "collection": "projects"
    }
  ],
  "tenant": "testing-tenant"
}
```
