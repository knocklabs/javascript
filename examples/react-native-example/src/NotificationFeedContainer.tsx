import { ActionButton, FeedItem } from "@knocklabs/client";
import { CloseCircle, NotificationFeed } from "@knocklabs/react-native";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// const onCellActionButtonTap = useCallback(
//   (params: { button: ActionButton; item: FeedItem }) => {
//     console.log(params);
//   },
//   [],
// );

// const onRowTap = useCallback((item: FeedItem) => {
//   console.log(item);
// }, []);

const onCellActionButtonTap = (params: {
  button: ActionButton;
  item: FeedItem;
}) => {
  console.log(params);
};

const onRowTap = (item: FeedItem) => {
  console.log(item);
};

const handleClose = () => {
  // Add logic for closing the view
  console.log("Close button pressed");
};
const NotificationFeedContainer: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          {/* <Text style={styles.closeButtonText}>X</Text> */}
        </TouchableOpacity>
      </View>
      <NotificationFeed
        onCellActionButtonTap={onCellActionButtonTap}
        onRowTap={onRowTap}
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
});
