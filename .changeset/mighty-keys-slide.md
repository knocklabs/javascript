---
"@knocklabs/react-native": patch
"@knocklabs/expo": patch
---

Fix `ReferenceError` raised on feed initialization

@knocklabs/react-native@0.6.13 and @knocklabs/expo@0.3.13 contained a bug in which the error
`ReferenceError: Property 'crypto' doesn't exist` would occur whenever initializing the feed via the
`useNotifications` hook or a call to `knock.feeds.initialize()`. This has been fixed by adding
[react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) as a
dependency of our React Native and Expo SDKs.
