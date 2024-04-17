import React from "react";
import { View } from "react-native";

export const NotificationFeedContainer: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <View>{children}</View>;
};
