import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type UnauthedStackParamList = {
  Startup: undefined;
  SignIn: undefined;
};

export type AuthedStackParamList = {
  Main: undefined;
  MessageCompose: undefined;
  Preferences: undefined;
  TenantSwitcher: undefined;
};

export type UnauthedScreenProps<R extends keyof UnauthedStackParamList> =
  NativeStackScreenProps<UnauthedStackParamList, R>;

export type AuthedScreenProps<R extends keyof AuthedStackParamList> =
  NativeStackScreenProps<AuthedStackParamList, R>;
