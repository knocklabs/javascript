import { FeedItem } from "@knocklabs/client";
import { ActionButton as ActionButtonModel } from "@knocklabs/client";
import {
  FilterStatus,
  useFeedSettings,
  useKnockFeed,
  useTranslations,
} from "@knocklabs/react-core";
import { useEffect, useState } from "react";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "../../../../theme/useTheme";

import { NotificationFeedCell } from "./NotificationFeedCell";
import NotificationFeedHeader, {
  TopHeaderAction,
} from "./NotificationFeedHeader";

export interface NotificationFeedProps {
  initialFilterStatus?: FilterStatus;
  onCellActionButtonTap: (params: {
    button: ActionButtonModel;
    item: FeedItem;
  }) => void;
  onRowTap?: (item: FeedItem) => void;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  initialFilterStatus = FilterStatus.All,
  onCellActionButtonTap,
  onRowTap,
}) => {
  const { feedClient, useFeedStore } = useKnockFeed();
  const { settings } = useFeedSettings(feedClient);
  const { loading, items, pageInfo } = useFeedStore();
  const [status, setStatus] = useState(initialFilterStatus);
  const { colors, fontSizes } = useTheme();
  const { t } = useTranslations();

  useEffect(() => {
    setStatus(initialFilterStatus);
  }, [initialFilterStatus]);

  useEffect(() => {
    feedClient.fetch({ status });
    const teardown = feedClient.listenForUpdates?.();
  }, [feedClient, status]);

  const onActionButtonTap = (action: TopHeaderAction) => {
    console.log(action);
  };

  const renderNotificationCell = ({ item }: { item: FeedItem }) => (
    <NotificationFeedCell
      item={item}
      onCellActionButtonTap={onCellActionButtonTap}
      onRowTap={onRowTap}
    />
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <NotificationFeedHeader
          selectedFilter={status}
          setFilterStatus={setStatus}
          onActionButtonTap={onActionButtonTap}
        />
      </View>
      <FlatList
        data={items}
        renderItem={renderNotificationCell}
        keyExtractor={(item: FeedItem) => item.id}
        ListEmptyComponent={<Text>No notifications found</Text>}
        ListFooterComponent={renderFooter}
        refreshControl={<RefreshControl refreshing={loading} />}
        contentContainerStyle={styles.list}
        style={styles.listContainer}
      />
      {settings?.features.branding_required && (
        <View style={styles.branding}>
          <Text>{t("poweredBy")}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  noNotifications: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  notifications: {
    width: "100%",
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  branding: {
    position: "absolute",
    bottom: 10,
    right: 10,
    opacity: 0.7,
  },
  list: {
    flexGrow: 1,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  topSection: {
    width: "100%",
  },
  title: {
    marginBottom: 12,
  },
});
