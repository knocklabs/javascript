This is a demo application to showcase Knock’s Microsoft Teams connector components, `MsTeamsAuthButton` and `MsTeamsAuthContainer`.

You'll also see how to create a user token with the proper access grants in `/set_token.ts`.

## Setting up Knock

1. Add a Microsoft Teams channel with the "Bot ID" and "Bot password" for your Microsoft Teams bot.
2. Add a workflow with a chat app channel step pointing to this Microsoft Teams channel.

## Setting environment variables

Note: you don't have to pre-create the tenant or connections object in Knock for this to work.

### Knock keys

- `NEXT_PUBLIC_KNOCK_API_URL`: https://api.knock.app - should stay the same
- `NEXT_PUBLIC_KNOCK_CLIENT_ID`: the public key under "Developers" > "API keys"
- `KNOCK_API_KEY`: the secret key under "Developers" > "API keys"
- `KNOCK_SIGNING_KEY`: generate a signing key under "Developers" > "API keys"

### Knock entities

- `NEXT_PUBLIC_TENANT_ID`: the ID of the tenant you want to use for holding the Microsoft Teams tenant ID

### Microsoft Teams notification configuration

- `NEXT_PUBLIC_MS_TEAMS_BOT_ID`: the ID of your Microsoft Teams bot
- `NEXT_PUBLIC_KNOCK_MS_TEAMS_CHANNEL_ID`: in the Knock dashboard on the Microsoft Teams channel
- `NEXT_PUBLIC_REDIRECT_URL`: set this to http://localhost:3000/ if running locally

## Running this application

1. Run the development server:

   ```bash
   yarn dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) with your browser.
3. Use one of the "Connect to Microsoft Teams" buttons to authorize Knock to communicate with your Microsoft tenant.
4. After this is successfully completed, you can check your Knock dashboard to see the tenant you chose populated with a Microsoft Teams tenant ID under its channel data.
