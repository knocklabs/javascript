import messaging from "@react-native-firebase/messaging";
import { AppRegistry } from "react-native";

import App from "./App";

// See https://rnfirebase.io/messaging/usage#background--quit-state-messages
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("Received background message", remoteMessage);
});

AppRegistry.registerComponent("KnockReactNativeExample", () => App);
