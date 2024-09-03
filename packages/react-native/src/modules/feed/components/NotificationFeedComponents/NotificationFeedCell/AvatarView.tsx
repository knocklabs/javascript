import React, { useCallback, useMemo } from "react";
import {
  Image,
  ImageStyle,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

import { useTheme } from "../../../../../theme/useTheme";

export interface AvatarViewProps {
  name?: string | null;
  src?: string | null;
  styleOverride?: AvatarViewStyle;
}

export interface AvatarViewStyle {
  container?: ViewStyle;
  image?: ImageStyle;
  text?: TextStyle;
}

export const AvatarView: React.FC<AvatarViewProps> = ({
  name,
  src,
  styleOverride = {},
}) => {
  const theme = useTheme();

  const defaultStyle = useMemo<AvatarViewStyle>(
    () => ({
      container: {
        justifyContent: "center",
        alignItems: "center",
        width: 32,
        height: 32,
        backgroundColor: theme.colors.gray5,
        borderRadius: 32 / 2,
      },
      image: {
        resizeMode: "cover",
        width: 32,
        height: 32,
        borderRadius: 32 / 2,
      },
      text: {
        fontWeight: theme.fontWeights.medium,
        color: theme.colors.gray11,
        fontSize: theme.fontSizes[3],
        fontFamily: theme.fontFamily.sanserif,
      },
    }),
    [theme],
  );

  const generateInitials = useMemo(() => {
    if (!name) return null;
    const nameComponents = name.split(" ");
    const initials = nameComponents
      .map((comp) => comp.charAt(0).toUpperCase())
      .join("");
    return initials;
  }, [name]);

  const renderInitialsView = useCallback(() => {
    if (generateInitials) {
      return (
        <Text style={[defaultStyle.text, styleOverride.text]}>
          {generateInitials}
        </Text>
      );
    } else {
      return null;
    }
  }, [generateInitials, styleOverride.text, defaultStyle.text]);

  return (
    <View style={[defaultStyle.container, styleOverride.container]}>
      {src ? (
        <Image
          source={{ uri: src }}
          style={[defaultStyle.image, styleOverride.image]}
          onError={() => renderInitialsView()}
        />
      ) : name ? (
        renderInitialsView()
      ) : null}
    </View>
  );
};

export default AvatarView;
