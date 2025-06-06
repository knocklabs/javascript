# Knock + Next.js example app

This example app uses [Knock](https://knock.app) to power in-app notifications. It uses the [Knock Node SDK](https://github.com/knocklabs/knock-node) and [Knock React SDK](../packages/react).

## Running locally

1. Install dependencies from the root of the monorepo.

```sh
yarn
```

2. Make sure the packages have been built by running `yarn build` or `yarn dev` from the root of the monorepo.

3. Configure the environment variables. Copy `.env.sample` to `.env.development.local` and add the relevant API keys and channel id from your Knock dashboard.

4. Run the example app

```sh
yarn dev
```

5. Open the example app at [localhost:3000](http://localhost:3000).
