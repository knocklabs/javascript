---
"@knocklabs/expo": patch
"@knocklabs/react-native": patch
---

Move `react-native-gesture-handler` from dependencies to peer dependencies so consumer apps do not install duplicate native module copies.
