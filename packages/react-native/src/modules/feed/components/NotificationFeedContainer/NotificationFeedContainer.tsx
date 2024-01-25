import React from "react";
import { View } from "react-native";

export const NotificationFeedContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <View>{children}</View>;
};
