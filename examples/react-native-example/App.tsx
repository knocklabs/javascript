import React from "react";
import { SafeAreaView, ScrollView, StatusBar } from "react-native";
import { Header } from "react-native/Libraries/NewAppScreen";

function App(): React.JSX.Element {
  return (
    <SafeAreaView>
      <StatusBar barStyle="light-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Header />
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;
