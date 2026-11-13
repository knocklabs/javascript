---
"@knocklabs/client": patch
"@knocklabs/eslint-config": patch
"@knocklabs/expo": patch
"@knocklabs/prettier-config": patch
"@knocklabs/react": patch
"@knocklabs/react-core": patch
"@knocklabs/react-native": patch
---

Patch the minimatch 9.0.9 copy flagged by Vanta. `minimatch@^9.0.0`, `^9.0.3`, and `^9.0.4` now resolve to 11.0.8, and `node-gyp@latest` now resolves to 13.1.0, which drops `glob@10`.
