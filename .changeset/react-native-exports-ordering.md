---
"@knocklabs/react-native": patch
---

Fix the `exports` map ordering so React Native's Metro bundler resolves the package to its source entry point (`src/index.ts`) via the `react-native` condition instead of the prebuilt CommonJS bundle. The `require` condition was previously listed first, shadowing `react-native` under Metro's package-exports resolution (enabled by default since React Native 0.79). The ordering now matches the other `@knocklabs/*` packages.
