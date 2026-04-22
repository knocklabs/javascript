import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import type { RootStackParamList } from "./navigation";
import MainScreen from "./screens/MainScreen";
import MessageComposeScreen from "./screens/MessageComposeScreen";
import PreferencesScreen from "./screens/PreferencesScreen";
import SignInScreen from "./screens/SignInScreen";
import StartupScreen from "./screens/StartupScreen";
import TenantSwitcherScreen from "./screens/TenantSwitcherScreen";
import { colors } from "./theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
    notification: colors.accent,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator initialRouteName="Startup">
          <Stack.Screen
            name="Startup"
            component={StartupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: "Sign in" }}
          />
          <Stack.Screen
            name="Main"
            component={MainScreen}
            options={{ title: "Knock", headerBackVisible: false }}
          />
          <Stack.Screen
            name="MessageCompose"
            component={MessageComposeScreen}
            options={{ title: "Compose message", presentation: "modal" }}
          />
          <Stack.Screen
            name="Preferences"
            component={PreferencesScreen}
            options={{ title: "Preferences" }}
          />
          <Stack.Screen
            name="TenantSwitcher"
            component={TenantSwitcherScreen}
            options={{ title: "Switch tenant", presentation: "modal" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
