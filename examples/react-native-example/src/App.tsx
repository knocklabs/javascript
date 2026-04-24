import {
  KnockFeedProvider,
  KnockProvider,
  KnockPushNotificationProvider,
} from "@knocklabs/react-native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "./auth";
import {
  KNOCK_API_KEY,
  KNOCK_HOSTNAME,
  KNOCK_IN_APP_CHANNEL_ID,
} from "./config";
import type {
  AuthedStackParamList,
  UnauthedStackParamList,
} from "./navigation";
import MainScreen from "./screens/MainScreen";
import MessageComposeScreen from "./screens/MessageComposeScreen";
import PreferencesScreen from "./screens/PreferencesScreen";
import SignInScreen from "./screens/SignInScreen";
import StartupScreen from "./screens/StartupScreen";
import TenantSwitcherScreen from "./screens/TenantSwitcherScreen";
import { colors } from "./theme";

const UnauthedStack = createNativeStackNavigator<UnauthedStackParamList>();
const AuthedStack = createNativeStackNavigator<AuthedStackParamList>();

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

function Navigator() {
  const { auth } = useAuth();

  if (!auth) {
    return (
      <UnauthedStack.Navigator initialRouteName="Startup">
        <UnauthedStack.Screen
          name="Startup"
          component={StartupScreen}
          options={{ headerShown: false }}
        />
        <UnauthedStack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: "Sign in" }}
        />
      </UnauthedStack.Navigator>
    );
  }

  return (
    <KnockProvider
      apiKey={KNOCK_API_KEY}
      host={KNOCK_HOSTNAME}
      user={{ id: auth.userId }}
      logLevel="debug"
    >
      <KnockPushNotificationProvider>
        <KnockFeedProvider
          feedId={KNOCK_IN_APP_CHANNEL_ID}
          defaultFeedOptions={auth.tenant ? { tenant: auth.tenant } : undefined}
        >
          <AuthedStack.Navigator>
            <AuthedStack.Screen
              name="Main"
              component={MainScreen}
              options={{ title: "Knock", headerBackVisible: false }}
            />
            <AuthedStack.Screen
              name="MessageCompose"
              component={MessageComposeScreen}
              options={{ title: "Compose message", presentation: "modal" }}
            />
            <AuthedStack.Screen
              name="Preferences"
              component={PreferencesScreen}
              options={{ title: "Preferences" }}
            />
            <AuthedStack.Screen
              name="TenantSwitcher"
              component={TenantSwitcherScreen}
              options={{ title: "Switch tenant", presentation: "modal" }}
            />
          </AuthedStack.Navigator>
        </KnockFeedProvider>
      </KnockPushNotificationProvider>
    </KnockProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <AuthProvider>
        <NavigationContainer theme={navTheme}>
          <Navigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
