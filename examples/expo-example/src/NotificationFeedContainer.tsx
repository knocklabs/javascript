import type { ActionButton, FeedItem } from "@knocklabs/client";
import { NotificationFeed } from "@knocklabs/expo";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface NotificationFeedContainerProps {
  handleClose: () => void;
}

const NotificationFeedContainer: React.FC<NotificationFeedContainerProps> = ({
  handleClose,
}) => {
  const onCellActionButtonTap = useCallback(
    (params: { button: ActionButton; item: FeedItem }) => {
      // handle button tap
    },
    [],
  );

  const onRowTap = useCallback((item: FeedItem) => {
    // handle row tap
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>X</Text>
        </TouchableOpacity>
      </View>
      <NotificationFeed
        onCellActionButtonTap={onCellActionButtonTap}
        onRowTap={onRowTap}
        containerStyle={styles.notificationFeed}
      />
    </View>
  );
};

export default NotificationFeedContainer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
  },
  notificationFeed: {
    backgroundColor: "#ff99ff",
  },
});
