# Knock + React Native example app

Demonstrates [`@knocklabs/react-native`](../../packages/react-native) in a bare React Native app. Mirrors the structure of the [Android](https://github.com/knocklabs/knock-android/tree/main/knock-example-app) and [iOS](https://github.com/knocklabs/ios-example-app) demos. For an Expo-managed example, see [`expo-example`](../expo-example).

## What this demo shows

Six screens, each demonstrating one piece of the SDK:

- **Startup** — splash before sign-in
- **Sign in** — identifies the user with `KnockProvider`
- **Main** — the in-app feed via the prebuilt `<NotificationFeed />` component
- **Compose message** — the shape of a workflow trigger payload
- **Preferences** — read and write the user's channel-type preferences via `usePreferences`
- **Switch tenant** — scope the feed and preferences to a tenant

## Running locally

1. Install dependencies from the root of the monorepo.

   ```sh
   yarn
   ```

2. Build the Knock packages.

   ```sh
   yarn build:packages
   ```

3. Configure the app. Open [`src/config.ts`](./src/config.ts) and replace the `KNOCK_*` placeholders with values from your [Knock dashboard](https://dashboard.knock.app).

4. Set up your React Native development environment. See the [React Native environment setup guide](https://reactnative.dev/docs/set-up-your-environment).

5. For iOS, install the CocoaPods dependencies once.

   ```sh
   cd ios && bundle install && bundle exec pod install && cd ..
   ```

6. Start Metro and launch on a simulator or device.

   ```sh
   yarn start

   # In another terminal:
   yarn ios
   # or
   yarn android
   ```

## Configuration

All runtime configuration lives as flat constants in [`src/config.ts`](./src/config.ts):

| Constant | What it is |
| --- | --- |
| `KNOCK_API_KEY` | Public API key. Dashboard → Developers → API keys. |
| `KNOCK_USER_ID` | A test user's ID. Comes from your auth system in production. |
| `KNOCK_IN_APP_CHANNEL_ID` | In-app feed channel ID. Integrations → In-app feed. |
| `KNOCK_PUSH_CHANNEL_ID` | APNs/FCM push channel ID. Integrations page. |
| `KNOCK_HOSTNAME` | Override for self-hosted or sandbox Knock. |
| `KNOCK_TENANT_A`, `KNOCK_TENANT_B` | Tenant IDs used by the tenant switcher. |

## Workflow triggers

The Compose screen shows the *shape* of a workflow trigger payload but does not call Knock directly. Triggers require your secret API key, which must not live in a mobile app — POST the payload to a trusted backend that calls `knock.workflows.trigger` on your behalf.

## Push notifications

The app wires `KnockPushNotificationProvider` so the SDK is ready to register device tokens, but the device-token registration code itself is not in this example. APNs and FCM setup require account-level configuration (certificates, Firebase project) that's out of scope here.
