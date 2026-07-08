---
"@knocklabs/client": patch
"@knocklabs/react": patch
"@knocklabs/react-core": patch
"@knocklabs/react-native": patch
"@knocklabs/expo": patch
---

Expose `./package.json` in each package's `exports` map. This restores the ability for tooling (bundlers, test mockers such as Storybook/Vitest, and version checks) to resolve the package manifest, which the `exports` field otherwise blocks.
