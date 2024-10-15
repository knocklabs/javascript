import {
  KnockFeedProvider,
  KnockProvider,
  NotificationIconButton,
} from "@knocklabs/react-native";
import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import "react-native-svg";

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
}

export default App;
