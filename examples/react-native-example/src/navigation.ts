import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Startup: undefined;
  SignIn: undefined;
  Main: undefined;
  MessageCompose: undefined;
  Preferences: undefined;
  TenantSwitcher: undefined;
};

export type ScreenProps<R extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, R>;
