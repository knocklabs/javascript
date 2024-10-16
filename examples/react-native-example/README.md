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

5. Set up your development environment to run native apps depending on your operating system and the platform you'd like to run the example on. See the [Expo docs](https://docs.expo.dev/guides/local-app-development/) for more information.

6. Run the example app. Optionally, specify which platform you'd like to run on

```sh
yarn start

# Or run the app on iOS
yarn ios

# Or run the app on Android
yarn android
```
