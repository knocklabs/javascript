# Knock + Expo example app

This example app uses [Knock](https://knock.app) to power in-app notifications. It uses the [Knock Expo SDK](../../packages/expo) and [Expo](https://docs.expo.dev/).

## Running locally

1. Install dependencies from the root of the monorepo.

```sh
yarn
```

2. Make sure the packages have been built by running `yarn build:packages`

3. Configure the environment variables. Copy `.env.sample` to `.env.development.local` and add the relevant API keys and channel id from your Knock dashboard.

4. Set up your development environment to run native apps depending on your operating system and the platform you'd like to run the example on. See the [Expo docs](https://docs.expo.dev/guides/local-app-development/) for more information.

5. Run the example app. Optionally, specify which platform you'd like to run on

```sh
yarn start

# Or run the app on iOS
yarn ios

# Or run the app on Android
yarn android
```
