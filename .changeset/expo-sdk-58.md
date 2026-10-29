---
"@knocklabs/expo": minor
"@knocklabs/react-native": minor
"@knocklabs/expo-example": minor
---

Move the `react-native-svg` dependency to `~15.16.0`, the version Expo SDK 58 ships. The `react-native` and `expo` peer ranges are unchanged. Apps on an older Expo SDK that also depend on `react-native-svg` can end up with two copies of it, so align `react-native-svg` to `~15.16.0` or upgrade to Expo SDK 58 alongside this release.
