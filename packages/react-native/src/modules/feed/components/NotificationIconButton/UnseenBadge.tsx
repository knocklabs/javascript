import { FeedMetadata } from "@knocklabs/client";
import { formatBadgeCount, useKnockFeed } from "@knocklabs/react-core";
import React from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";

import { useTheme } from "../../../../theme/useTheme";

export type BadgeCountType = "unseen" | "unread" | "all";

export type UnseenBadgeProps = {
  badgeCountType?: BadgeCountType;
  textStyle?: TextStyle;
};

function selectBadgeCount(
  badgeCountType: BadgeCountType,
  metadata: FeedMetadata,
) {
  switch (badgeCountType) {
    case "all":
      return metadata.total_count;
    case "unread":
      return metadata.unread_count;
    case "unseen":
      return metadata.unseen_count;
  }
}

export const UnseenBadge: React.FC<UnseenBadgeProps> = ({
  badgeCountType = "unread",
  textStyle = {},
}) => {
  const { useFeedStore } = useKnockFeed();
  const badgeCountValue = useFeedStore((state) =>
    selectBadgeCount(badgeCountType, state.metadata),
  );

  return badgeCountValue !== 0 ? (
    <View
      style={[
        styles.badgeContainer,
        { backgroundColor: useTheme().colors.accent9 },
      ]}
    >
      <Text
        style={[
          styles.badgeCount,
          {
            fontSize: useTheme().fontSizes.knock0,
            fontFamily: useTheme().fontFamily.sanserif,
            fontWeight: useTheme().fontWeights.medium,
          },
          textStyle,
        ]}
        numberOfLines={1}
      >
        {formatBadgeCount(badgeCountValue)}
      </Text>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  badgeContainer: {
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 20, // Minimum width to ensure it looks like a circle or oval
    minHeight: 20,
    flexDirection: "row",
    position: "absolute", // Ensure the badge is positioned absolutely
  },
  badgeCount: {
    color: "white",
  },
});
