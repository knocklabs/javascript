# Knock + React Native example app

This example app uses [Knock](https://knock.app) to power in-app notifications. It uses the [Knock React Native SDK](../../packages/react-native).

> Using Expo? See our [Knock + Expo example app](../expo-example/README.md).

## Running locally

1. If you haven't already, [set up your environment for React Native development](https://reactnative.dev/docs/set-up-your-environment).

2. Install dependencies from the root of the monorepo.

```sh
yarn
```

3. Make sure the packages have been built by running `yarn build:packages`

4. Configure the environment variables. Copy `.env.sample` to `.env` and add the relevant API keys and channel id from your Knock dashboard.

5. Run the example app. Optionally, specify which platform you'd like to run on:

```sh
yarn start

# Or run the app on iOS
yarn ios

# Or run the app on Android
yarn android
```

## Testing push notifications on Android

1. If you haven't already, set up a new Firebase Cloud Messaging (FCM) channel in your Knock dashboard. See [_How to configure FCM with Knock_](https://docs.knock.app/integrations/push/firebase#how-to-configure-fcm-with-knock).

1. Copy the `google-services.json` file downloaded from the Firebase console into the `android/app/` directory.

1. Update your `.env` file to set the `KNOCK_FCM_CHANNEL_ID` env var to the channel ID of your FCM channel in Knock.

1. Run `yarn android` to rebuild the app.
