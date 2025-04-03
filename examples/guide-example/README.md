# Knock In-App Guide Example

This example app demonstrates how to use the Knock Guide client.

## Running locally

1. Install dependencies from the root of the monorepo.

```sh
yarn
```

2. Make sure the packages have been built by running `yarn build` from the root of the monorepo.

```sh
yarn build --filter="./packages/client" --filter="./packages/react" --filter="./packages/react-core" --filter="./examples/guide-example"
```

3. Configure the environment variables. Copy `.env.sample` to `.env.development.local` and add the relevant API keys and channel id from your Knock dashboard.

4. Run the example app

```sh
yarn dev --filter="./packages/*" --filter="./examples/guide-example"
```

5. Open the example app at [localhost:5173](http://localhost:5173).
