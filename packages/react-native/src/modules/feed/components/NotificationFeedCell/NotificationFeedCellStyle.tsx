import { TextStyle, ViewStyle } from "react-native";

import theme from "../../../../helpers/theme";

import { ActionButtonStyle } from "./ActionButton";
import { AvatarViewStyle } from "./AvatarView";

export interface NotificationFeedCellStyle {
  unreadNotificationCircleColor: string;
  showAvatarView: boolean;
  avatarViewStyle: AvatarViewStyle;
  primaryActionButtonStyle: ActionButtonStyle;
  secondaryActionButtonStyle: ActionButtonStyle;
  sentAtDateFormatter: Intl.DateTimeFormat;
  sentAtDateText: TextStyle;
}

export const defaultStyle: NotificationFeedCellStyle = {
  unreadNotificationCircleColor: theme.colors.blue9,
  showAvatarView: true,
  avatarViewStyle: {},
  primaryActionButtonStyle: {},
  secondaryActionButtonStyle: {},
  sentAtDateFormatter: new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }),
  sentAtDateText: { fontSize: 12 },
};
