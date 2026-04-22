# Knock + React Native example app

Demonstrates [`@knocklabs/react-native`](../../packages/react-native) in a bare React Native app. For an Expo-managed example, see [`expo-example`](../expo-example).

## Running locally

1. Install dependencies from the root of the monorepo.

```sh
yarn
```

2. Build the Knock packages.

```sh
yarn build:packages
```

3. Configure the app. Open [`src/config.ts`](./src/config.ts) and replace the placeholder values with your Knock public API key, a test user ID, and your in-app feed channel ID.

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

All runtime configuration lives in [`src/config.ts`](./src/config.ts). It's a single exported object with a `publicApiKey`, `userId`, optional `tenantId`, and `feedChannelId`. Values come from the [Knock dashboard](https://dashboard.knock.app).

In a production app these would come from your backend (for `userId`) and your environment (for the channel and tenant IDs). For this example they're hardcoded so you can get running quickly.
