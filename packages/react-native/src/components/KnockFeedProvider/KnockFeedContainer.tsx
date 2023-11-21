import React from "react";
import { View } from "react-native";

export const KnockFeedContainer: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return <View>{children}</View>;
};
