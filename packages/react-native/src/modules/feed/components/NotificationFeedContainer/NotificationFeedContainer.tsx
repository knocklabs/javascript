import { FunctionComponent, ReactNode } from "react";
import { View } from "react-native";

export const NotificationFeedContainer: FunctionComponent<{
  children?: ReactNode | undefined;
}> = ({ children }) => <View>{children}</View>;
