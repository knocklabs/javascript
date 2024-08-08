import {
  ButtonSetContentBlock,
  FeedItem,
  MarkdownContentBlock,
  Recipient,
  User,
} from "@knocklabs/client";
import { ActionButton as ActionButtonModel } from "@knocklabs/client";
import React, { memo, useCallback, useMemo } from "react";
import {
  ImageStyle,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
  useWindowDimensions,
} from "react-native";
import { RenderHTML } from "react-native-render-html";

import { useTheme } from "../../../../../theme/useTheme";
import {
  ActionButton,
  ActionButtonStyle,
  ActionButtonType,
} from "../../ActionButton";
import DividerView from "../../Divider";

import AvatarView, { AvatarViewStyle } from "./AvatarView";

export interface NotificationFeedCellStyle {
  unreadNotificationCircleColor?: string;
  showAvatarView?: boolean;
  avatarViewStyle?: AvatarViewStyle;
  primaryActionButtonStyle?: ActionButtonStyle;
  secondaryActionButtonStyle?: ActionButtonStyle;
  sentAtDateFormatter?: Intl.DateTimeFormat;
  sentAtDateTextStyle?: TextStyle;
  htmlStyles?: { [key: string]: TextStyle | ViewStyle | ImageStyle };
}

export interface NotificationFeedCellProps {
  item: FeedItem;
  styleOverride?: NotificationFeedCellStyle;
  onCellActionButtonTap?: (params: {
    button: ActionButtonModel;
    item: FeedItem;
  }) => void;
  onRowTap?: (item: FeedItem) => void;
}

function isUser(recipient: Recipient): recipient is User {
  return (recipient as User) !== undefined;
}

export const NotificationFeedCell: React.FC<NotificationFeedCellProps> = memo(
  ({
    item,
    styleOverride = {},
    onCellActionButtonTap = () => {},
    onRowTap = () => {},
  }) => {
    const isRead = item.read_at !== null;
    const actor = item.actors[0];
    const theme = useTheme();

    const resolvedStyle = useMemo<NotificationFeedCellStyle>(
      () => ({
        unreadNotificationCircleColor:
          styleOverride?.unreadNotificationCircleColor ?? theme.colors.blue9,
        showAvatarView: styleOverride?.showAvatarView ?? true,
        avatarViewStyle: styleOverride?.avatarViewStyle ?? {},
        primaryActionButtonStyle: styleOverride?.primaryActionButtonStyle ?? {},
        secondaryActionButtonStyle:
          styleOverride?.secondaryActionButtonStyle ?? {},
        sentAtDateFormatter:
          styleOverride?.sentAtDateFormatter ??
          new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
        sentAtDateTextStyle: styleOverride?.sentAtDateTextStyle ?? {
          fontSize: theme.fontSizes.knock2,
          color: theme.colors.gray9,
          fontWeight: theme.fontWeights.medium,
        },
        htmlStyles: styleOverride?.htmlStyles ?? {
          p: {
            fontSize: theme.fontSizes.knock2,
            fontFamily: theme.fontFamily.sanserif,
            margin: 0,
            color: theme.colors.gray12,
          },
          blockquote: {
            color: theme.colors.gray11,
            borderLeftWidth: 4,
            borderLeftColor: theme.colors.gray6,
            paddingLeft: 12,
            paddingVertical: 4,
            margin: 0,
            marginTop: 12,
          },
        },
      }),
      [theme, styleOverride],
    );

    const { width } = useWindowDimensions();

    const renderMarkdownContent = useCallback(
      (block: MarkdownContentBlock) => (
        <RenderHTML
          contentWidth={width}
          source={{ html: block.rendered }}
          tagsStyles={resolvedStyle.htmlStyles as any}
        />
      ),
      [width, resolvedStyle.htmlStyles],
    );

    const renderActionButtonsContent = useCallback(
      (block: ButtonSetContentBlock) => (
        <View style={layoutStyles.buttonContainer}>
          {block.buttons.map((button, index) => (
            <ActionButton
              key={`button-${index}`}
              title={button.label}
              type={
                button.name === "primary"
                  ? ActionButtonType.PRIMARY
                  : ActionButtonType.SECONDARY
              }
              styleOverride={
                button.name === "primary"
                  ? resolvedStyle.primaryActionButtonStyle
                  : resolvedStyle.secondaryActionButtonStyle
              }
              action={() => onCellActionButtonTap({ button, item })}
            />
          ))}
        </View>
      ),
      [onCellActionButtonTap, item],
    );

    return (
      <TouchableOpacity onPress={() => onRowTap(item)}>
        <View style={layoutStyles.container}>
          <View style={layoutStyles.row}>
            <View style={layoutStyles.leftContainer}>
              <View
                style={[
                  layoutStyles.circle,
                  isRead
                    ? { backgroundColor: "transparent" }
                    : {
                        backgroundColor:
                          resolvedStyle.unreadNotificationCircleColor,
                      },
                ]}
              />
              {resolvedStyle.showAvatarView && actor && isUser(actor) && (
                <View>
                  <AvatarView name={actor.name} src={actor.avatar} />
                </View>
              )}
            </View>
            <View style={layoutStyles.contentContainer}>
              {item.blocks.map((block, index) => {
                if (block.type === "markdown") {
                  return (
                    <View key={`markdown-${index}`}>
                      {renderMarkdownContent(block as MarkdownContentBlock)}
                    </View>
                  );
                } else if (block.type === "button_set") {
                  return (
                    <View key={`buttonset-${index}`}>
                      {renderActionButtonsContent(
                        block as ButtonSetContentBlock,
                      )}
                    </View>
                  );
                } else {
                  return null;
                }
              })}
              {item.inserted_at && (
                <Text
                  style={[
                    layoutStyles.dateText,
                    resolvedStyle.sentAtDateTextStyle,
                  ]}
                >
                  {resolvedStyle.sentAtDateFormatter!.format(
                    new Date(item.inserted_at),
                  )}
                </Text>
              )}
            </View>
          </View>
          <DividerView styleOverride={layoutStyles.divider} />
        </View>
      </TouchableOpacity>
    );
  },
);

const layoutStyles = StyleSheet.create({
  container: {
    paddingTop: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 12,
    paddingLeft: 12,
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
  },
  dateText: {
    marginTop: 12,
  },
  divider: {
    marginTop: 12,
  },
});
