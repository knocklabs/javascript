import {
  ButtonSetContentBlock,
  FeedItem,
  MarkdownContentBlock,
  Recipient,
  User,
} from "@knocklabs/client";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import theme from "../../../../helpers/theme";

import ActionButton from "./ActionButton";
import { ActionButtonType } from "./ActionButtonTypes";
import AvatarView from "./AvatarView";
import {
  NotificationFeedCellStyle,
  defaultStyle,
} from "./NotificationFeedCellStyle";

interface NotificationFeedCellProps {
  item: FeedItem;
  styleOverride?: NotificationFeedCellStyle;
  buttonTapAction: (action: string) => void;
}

function isUser(recipient: Recipient): recipient is User {
  return (recipient as User) !== undefined;
}

const NotificationFeedCell: React.FC<NotificationFeedCellProps> = ({
  item,
  styleOverride = {},
  buttonTapAction,
}) => {
  const isRead = item.read_at !== null;
  const actor = item.actors[0];

  const renderMarkdownContent = (block: MarkdownContentBlock) => (
    <Text>{block.rendered}</Text>
  );

  const renderActionButtonsContent = (block: ButtonSetContentBlock) => (
    <View style={layoutStyles.buttonContainer}>
      {block.buttons.map((button, index) => (
        <ActionButton
          title={button.label}
          type={ActionButtonType.PRIMARY}
          action={() => buttonTapAction(button.action)}
        />
      ))}
    </View>
  );

  return (
    <View style={layoutStyles.container}>
      <View style={layoutStyles.row}>
        <View style={layoutStyles.leftContainer}>
          <View
            style={[
              layoutStyles.circle,
              isRead
                ? { backgroundColor: "transparent" }
                : {
                    backgroundColor: defaultStyle.unreadNotificationCircleColor,
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
          {item.blocks.map((block, index) => {
            if (block.type === "markdown") {
              return renderMarkdownContent(block as MarkdownContentBlock);
            } else if (block.type === "button_set") {
              return renderActionButtonsContent(block as ButtonSetContentBlock);
            } else {
              return null;
            }
          })}
          {item.inserted_at && (
            <Text style={[layoutStyles.dateText, defaultStyle.sentAtDateText]}>
              {defaultStyle.sentAtDateFormatter.format(
                new Date(item.inserted_at),
              )}
            </Text>
          )}
        </View>
      </View>
      <View style={layoutStyles.divider} />
    </View>
  );
};

const layoutStyles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  leftContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
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

export default NotificationFeedCell;
