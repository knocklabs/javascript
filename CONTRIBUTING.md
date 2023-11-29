# Contributing Guide

## Developing locally

### Monorepo setup

The current monorepo setup is based on:

- [Yarn workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/), used for managing multiple packages from a single repository.
- [Turborepo](https://turbo.build/repo/docs), used for task running and task output caching.
- [GitHub Actions](https://docs.github.com/en/actions), used for quality checks and automated release orchestration.

Packages are inside the [packages](/packages) directory. Refer to each package's README for specific instructions on installation and usage.

### Packages

- `react` - Knock React SDK with hooks and components for building web notification experiences
- `react-native` - Knock React Native SDK with hooks and components for building mobile notification experiences
- `react-core` - Internal utilities shared by the React and React Native SDKs
- `eslint-config`, `typescript-config` - Shared configuration for our packages and examples

### Examples

- `nextjs-example` - A sample Next.js app showing how to use the Knock in-app feed

### Prerequisites

1. Have a version of Yarn and Node installed that is compatible with the versions defined in `.tool-versions`.
2. Install dependencies. **Always run `yarn` from the root of the monorepo**, so that dependencies are installed correctly for all packages:

```sh
# Install dependencies
yarn
# Add a dependency
yarn workspace <workspace> add <package>
```

3. Build all packages or run them locally:

```sh
# Build all packages
yarn build

# or run them in development
yarn dev
```
