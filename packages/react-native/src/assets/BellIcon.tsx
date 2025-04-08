import React from "react";
import { ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useTheme } from "../theme/useTheme";

type BellIconProps = {
  width?: number;
  height?: number;
  style?: ViewStyle;
  strokeColor?: string;
};

const BellIcon: React.FC<BellIconProps> = ({
  width = 24,
  height = 24,
  style,
  strokeColor,
}) => {
  const theme = useTheme();

  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeColor ?? theme.colors.gray12}
      style={style}
    >
      <Path
        d="M20.0474 16.4728C18.8436 14.9996 17.9938 14.2496 17.9938 10.1879C17.9938 6.46832 16.0944 5.14317 14.5311 4.49957C14.3235 4.41426 14.128 4.21832 14.0647 4.00504C13.7905 3.07176 13.0217 2.24957 11.9999 2.24957C10.978 2.24957 10.2088 3.07223 9.93736 4.00598C9.87408 4.2216 9.67861 4.41426 9.47096 4.49957C7.9058 5.1441 6.0083 6.46457 6.0083 10.1879C6.00596 14.2496 5.15611 14.9996 3.95237 16.4728C3.45362 17.0832 3.89049 17.9996 4.76283 17.9996H19.2416C20.1092 17.9996 20.5433 17.0803 20.0474 16.4728Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14.9999 17.9988V18.7488C14.9999 19.5445 14.6838 20.3075 14.1212 20.8701C13.5586 21.4327 12.7955 21.7488 11.9999 21.7488C11.2042 21.7488 10.4412 21.4327 9.87856 20.8701C9.31595 20.3075 8.99988 19.5445 8.99988 18.7488V17.9988"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export { BellIcon };
