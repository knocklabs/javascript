# AI Agent Guidelines

This is the official Knock JavaScript SDK monorepo. Knock provides flexible, reliable notifications infrastructure.

## Repository Structure

- **`packages/`** - Published npm packages under `@knocklabs/` scope
  - `client` - Core JavaScript client for Knock API
  - `react` - React SDK with hooks and components for web notification UIs
  - `react-native` - React Native SDK for mobile apps
  - `react-core` - Shared internal utilities for React SDKs
  - `expo` - Expo integration
  - `types` - Shared TypeScript types
  - `eslint-config`, `prettier-config`, `typescript-config` - Shared configs

- **`examples/`** - Example applications demonstrating SDK usage

- **`integration/`** - Integration tests

## Development Commands

```sh
# Install dependencies (always from repo root)
yarn

# Build all packages
yarn build

# Run packages in development mode
yarn dev

# Run tests
yarn test

# Type checking
yarn type:check

# Linting
yarn lint

# Format code
yarn format
```

## Key Conventions

- **Monorepo**: Uses Yarn workspaces + Turborepo
- **Node version**: 22.17.0 (see `engines` in package.json)
- **Package manager**: Yarn 4.1.0
- **Testing**: Vitest
- **Releases**: Changesets for versioning

## Adding Dependencies

```sh
# Add to a specific workspace
yarn workspace <workspace-name> add <package>
```

## Testing

- Unit tests are colocated in `test/` directories within each package
- Integration tests for React are in `integration/tests/`
- Run `yarn test` from the repo root

