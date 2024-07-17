import {
  ButtonSetContentBlock,
  FeedItem,
  MarkdownContentBlock,
  Recipient,
  User,
} from "@knocklabs/client";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HTMLView from "react-native-htmlview";

import { ActionButton, ActionButtonType } from "../ActionButton";

import AvatarView from "./AvatarView";
import {
  NotificationFeedCellStyle,
  defaultStyle,
} from "./NotificationFeedCellStyle";

export interface NotificationFeedCellProps {
  item: FeedItem;
  styleOverride?: NotificationFeedCellStyle;
  buttonTapAction: (action: string) => void;
  onRowTap?: (item: FeedItem) => void;
}

function isUser(recipient: Recipient): recipient is User {
  return (recipient as User) !== undefined;
}

export const NotificationFeedCell: React.FC<NotificationFeedCellProps> = ({
  item,
  styleOverride = {},
  buttonTapAction,
  onRowTap = () => {},
}) => {
  const isRead = item.read_at !== null;
  const actor = item.actors[0];

  const renderMarkdownContent = (block: MarkdownContentBlock) => (
    <HTMLView value={block.rendered} />
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
          action={() => buttonTapAction(button.action)}
        />
      ))}
    </View>
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
        <View style={layoutStyles.divider} />
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
  divider: {
    height: 1,
    backgroundColor: "#d9d9d9",
    marginTop: 12,
  },
});
