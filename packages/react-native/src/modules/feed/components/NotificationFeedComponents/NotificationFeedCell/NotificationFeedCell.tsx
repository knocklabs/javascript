import {
  ButtonSetContentBlock,
  FeedItem,
  MarkdownContentBlock,
  Recipient,
  User,
} from "@knocklabs/client";
import { ActionButton as ActionButtonModel } from "@knocklabs/client";
import React from "react";
import {
  ImageStyle,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import HTMLView from "react-native-htmlview";

import { useTheme } from "../../../../../theme/useTheme";
import {
  ActionButton,
  ActionButtonStyle,
  ActionButtonType,
} from "../../ActionButton";
import DividerView from "../../Divider";

import AvatarView, { AvatarViewStyle } from "./AvatarView";

export interface NotificationFeedCellStyle {
  unreadNotificationCircleColor: string;
  showAvatarView: boolean;
  avatarViewStyle: AvatarViewStyle;
  primaryActionButtonStyle: ActionButtonStyle;
  secondaryActionButtonStyle: ActionButtonStyle;
  tertiaryActionButtonStyle: ActionButtonStyle;
  sentAtDateFormatter: Intl.DateTimeFormat;
  sentAtDateTextStyle: TextStyle;
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

export const NotificationFeedCell: React.FC<NotificationFeedCellProps> = ({
  item,
  styleOverride = {},
  onCellActionButtonTap = () => {},
  onRowTap = () => {},
}) => {
  const isRead = item.read_at !== null;
  const actor = item.actors[0];
  const theme = useTheme();

  const renderMarkdownContent = (block: MarkdownContentBlock) => (
    <HTMLView value={block.rendered} stylesheet={defaultStyle.htmlStyles} />
  );

  const renderActionButtonsContent = (block: ButtonSetContentBlock) => (
    <View style={layoutStyles.buttonContainer}>
      {block.buttons.map((button, index) => (
        <ActionButton
          key={index}
          title={button.label}
          type={
            button.name === "primary"
              ? ActionButtonType.PRIMARY
              : ActionButtonType.SECONDARY
          }
          action={() => onCellActionButtonTap({ button, item })}
        />
      ))}
    </View>
  );

  const defaultStyle: NotificationFeedCellStyle = {
    unreadNotificationCircleColor: theme.colors.blue9,
    showAvatarView: true,
    avatarViewStyle: {},
    primaryActionButtonStyle: {},
    secondaryActionButtonStyle: {},
    tertiaryActionButtonStyle: {},
    sentAtDateFormatter: new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    sentAtDateTextStyle: {
      fontSize: theme.fontSizes.knock2,
      color: theme.colors.gray9,
      fontWeight: theme.fontWeights.medium,
    },
    htmlStyles: {
      p: {
        fontSize: theme.fontSizes.knock2,
      },
      blockquote: {
        color: theme.colors.gray11,
        paddingLeft: 8,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.gray9,
        // borderBlockEndColor: theme.colors.gray9,
        marginTop: -16,
      },
    },
  };

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
                        defaultStyle.unreadNotificationCircleColor,
                    },
              ]}
            />
            {defaultStyle.showAvatarView && actor && isUser(actor) && (
              <View>
                <AvatarView name={actor.name} src={actor.avatar} />
              </View>
            )}
          </View>
          <View style={layoutStyles.contentContainer}>
            {item.blocks.map((block) => {
              if (block.type === "markdown") {
                return renderMarkdownContent(block as MarkdownContentBlock);
              } else if (block.type === "button_set") {
                return renderActionButtonsContent(
                  block as ButtonSetContentBlock,
                );
              } else {
                return null;
              }
            })}
            {item.inserted_at && (
              <Text
                style={[layoutStyles.dateText, defaultStyle.sentAtDateText]}
              >
                {defaultStyle.sentAtDateFormatter.format(
                  new Date(item.inserted_at),
                )}
              </Text>
            )}
          </View>
        </View>
        <DividerView />
      </View>
    </TouchableOpacity>
  );
};

const layoutStyles = StyleSheet.create({
  container: {
    paddingTop: 12,
    paddingHorizontal: 0,
    margin: 0,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingRight: 12,
    paddingLeft: 8,
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
    marginTop: 8,
  },
});
