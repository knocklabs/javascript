---
"@knocklabs/react-native": minor
"@knocklabs/expo": minor
---

chore(deps): bump react-native-get-random-values from 1.11.0 to 2.0.0

v2 of the polyfill is new architecture only and requires React Native >= 0.81
(Expo SDK >= 54). `@knocklabs/react-native` imports it for its side effects from
`src/index.ts`, so that floor now applies to every consumer of the package, and
to `@knocklabs/expo` by way of its dependency on `@knocklabs/react-native`.

The `react-native` peer range on both packages has been narrowed from `*` to
`>=0.81`, so installs on unsupported versions surface a peer warning instead of
failing at runtime when the native module is missing. Expo SDK 54 is the release
that ships React Native 0.81, so the `expo` peer stays at `*` and the
`react-native` constraint covers both.
