# Knock Javascript SDK Integration Testing

Because the Knock SDK can be utilized in different versions of React, it's vital that we have visibility into this surface area. This package aims to give maintainers an easy way to verify that their package
works across the versions of react that we support.

## Getting started

First you will need to setup your environment variables so that the test runner can properly run any of the functions and components that we are testing. You can find an example of what this file should like in `.env.sample`. For Knock employees, you can find the file contents in the 1Password vault titled "JS SDK Integration Testing Env File".

## Running the integration tests locally

There are 3 different ways that you can run the test suite depending on the result you're looking for.

Run for all versions of react that we support:

```bash
yarn test:integration
```

Run for individual version of react that we support:

```bash
yarn test:integration:react-18
yarn test:integration:react-19
```

Run for a specific version of react not already defined in `package.json`

```bash
./integration/run-integration.sh x.x.x
```

It's recommended that you build your packages using `yarn build:packages` before running this command, to ensure that the test suite references the correctly built packages when running the test suite.

> [!CAUTION]
> When running the integration tests, the runner will perform a `yarn install` so that the correct version of react is present. In doing so, it will add the `resolutions` key to the root `package.json` temporarily while the test suite runs. Please make sure that the `resolutions` key is **NEVER** committed to version control. See more details about how this process works below.

## Adding new tests

To add new tests to our integration test suite, navigate to `./integration/tests`. We try to categorize tests into top level grouping so that they're easier to find later. For this test suite, at this point in time, we're only _really_ looking to see if the current package can work in multiple versions of react. So, all that you need to do is make sure the component or function is called in the test and ran.

Here's an example of adding a component to our test suite.

```tsx
import { NotificationFeed } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

describe("NotificationFeed", () => {
  it("should render", () => {
    render(<NotificationFeed />);
  });
});
```

## Explanation of the architecture

In order to reproduce the most realistic integration test, we need to:

1. Build our packages with the react version currently present in the repo.
2. Override that react version when testing to see how our code responds in those scenarios, similar to how `peerDependencies` work.

### The issue

Unfortunately, this isn't super straightforward. In our `yarn` monorepo there is a single version of `react` present. We do this so that there are not multiple versions running at the same time to avoid this error:

```
A React Element from an older version of React was rendered. This is not supported. It can happen if:
- Multiple copies of "react" are used
- A library pre-bundled an old copy of "react" or "react/jsx-runtime"
- A compiler tries to "inline" JSX instead of using the runtime.
```

This means that if we want to test specific versions of react in our integration tests, the entire repo will need to resolve to that version. The initial solve would be to add this specific version as the one that is referenced in `@knocklabs/integration`, this won't work. The resolved version of `react` will end up being the version hoisted in the root `node_modules`. If you try to override that by pointing directly to specific version of `react` in the `node_modules` folder via `vitest` alias (or other solution), you will get the above error because the built version and the resolved version will be running at the same time. We could build the packages utilizing the version we want to test against, but that means in some cases the build would not succeed even though the package would work with a lower version of react.

There is no "easy" way around this.

### The solve

Luckily, `yarn` v4 gives us one singular escape hatch, the `resolutions` key in `package.json`. This config will override **EVERY** version of the specified package throughout the repo, yippee. But the caveat is this value is only configurable in the monorepo's root `package.json` file. So, if we want to test specific `react` versions we'll need to add the `resolutions` key defining those versions. Here's how our script works.

1. Take in the `react` version that the maintainer wants to test. Any version should be easily testable without any extra configuration. So we take this in as a parameter when running the script, example: `./integration.run-integration.sh 18.2.0`.
2. Create a copy of the monorepo's root `package.json` file so that we can restore it back to it's original state after the run. This helps to prevent the maintainer from committing configuration changes to version control every time they need to test a different version of `react`.
3. Set the `resolutions` key to the specified `react` version passed as a parameter and write it to the `package.json` file. This sets the version for `react` and `react-dom`.
4. Run `yarn` so that each instance of `react` points to the specified version.
5. Run the test suite from `@knocklabs/integration` via `yarn test:integration:runner`
6. Restore the `package.json` file back to it's original state, removing the `resolutions` key entirely.
7. Run `yarn` again to restore the dependencies back to their original state.

Full script exists here:

```
./integration/run-integration.sh
```

Running the test suite in this way gives the maintainer the ability to locally run the test suite while also allowing us to run the same script in CI. This setup is the best we've found without introducing a TON of overhead to our repo. The crux of this issue is how dependency hoisting is managed in a monorepo. Yarn has a [great article](https://classic.yarnpkg.com/blog/2018/02/15/nohoist/) describing this pattern in more detail, note that this is referencing `yarn` v1 under the "How to use it?" section, which is not applicable to us since we use `yarn` v4.
