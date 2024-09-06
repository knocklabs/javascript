import { FeedItem } from "@knocklabs/client";
import {
  ActionButton,
  NetworkStatus,
  isRequestInFlight,
} from "@knocklabs/client";
import {
  FilterStatus,
  useFeedSettings,
  useKnockFeed,
} from "@knocklabs/react-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";

import { PoweredByKnockIcon } from "../../../../assets/PoweredByKnockIcon";
import { useTheme } from "../../../../theme/useTheme";

import EmptyNotificationFeed, {
  EmptyNotificationFeedStyle,
} from "./EmptyNotificationFeed";
import {
  NotificationFeedCell,
  NotificationFeedCellStyle,
} from "./NotificationFeedCell";
import NotificationFeedHeader, {
  NotificationFeedHeaderConfig,
  TopHeaderAction,
} from "./NotificationFeedHeader";

export interface NotificationFeedProps {
  notificationRowStyle?: NotificationFeedCellStyle; // Customize style of the NotificationRows
  headerConfig?: NotificationFeedHeaderConfig; // Customize the top filters and buttons
  emptyFeedStyle?: EmptyNotificationFeedStyle;
  onCellActionButtonTap?: (params: {
    button: ActionButton;
    item: FeedItem;
  }) => void;
  onRowTap?: (item: FeedItem) => void;
}

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  notificationRowStyle = undefined,
  headerConfig = undefined,
  emptyFeedStyle = undefined,
  onCellActionButtonTap = () => {},
  onRowTap = () => {},
}) => {
  const { feedClient, useFeedStore } = useKnockFeed();
  const { settings } = useFeedSettings(feedClient);
  const { pageInfo, items, networkStatus, metadata } = useFeedStore();
  const [status, setStatus] = useState(
    headerConfig?.filters?.[0] ?? FilterStatus.All,
  );

  const onTopActionButtonTap = useCallback(
    (action: TopHeaderAction) => {
      if (action === TopHeaderAction.MARK_ALL_AS_READ) {
        feedClient.markAllAsRead();
      } else {
        feedClient.markAllReadAsArchived();
      }
    },
    [feedClient],
  );

  const onViewOpen = useCallback(() => {
    if (metadata.unseen_count > 0) {
      feedClient.markAllAsSeen();
    }
  }, [metadata.unseen_count, feedClient]);

  const requestInFlight = useMemo(
    () => isRequestInFlight(networkStatus),
    [networkStatus],
  );

  const onEndReached = useCallback(() => {
    if (!requestInFlight && pageInfo.after) {
      feedClient.fetchNextPage();
    }
  }, [requestInFlight, pageInfo, feedClient]);

  const renderNotificationCell = useCallback(
    ({ item }: { item: FeedItem }) => (
      <NotificationFeedCell
        item={item}
        styleOverride={notificationRowStyle}
        onCellActionButtonTap={onCellActionButtonTap}
        onRowTap={onRowTap}
      />
    ),
    [notificationRowStyle, onCellActionButtonTap, onRowTap],
  );

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <ActivityIndicator />
      </View>
    ),
    [],
  );

  useEffect(() => {
    feedClient.fetch({ status });
  }, [feedClient, status]);

  useEffect(() => {
    onViewOpen();
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: useTheme().colors.surface1 },
      ]}
    >
      <View>
        <NotificationFeedHeader
          selectedFilter={status}
          config={headerConfig}
          setFilterStatus={setStatus}
          onTopActionButtonTap={onTopActionButtonTap}
        />
      </View>
      <FlatList
        data={items}
        renderItem={renderNotificationCell}
        keyExtractor={(item: FeedItem) => item.id}
        ListEmptyComponent={
          !requestInFlight ? (
            <EmptyNotificationFeed styleOverride={emptyFeedStyle} />
          ) : null
        }
        ListFooterComponent={
          networkStatus === NetworkStatus.fetchMore ? renderFooter : null
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              feedClient.fetch({ status });
            }}
            refreshing={networkStatus === NetworkStatus.loading}
          />
        }
        contentContainerStyle={styles.list}
        style={styles.listContainer}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.5}
      />
      {settings?.features.branding_required && (
        <View style={styles.branding}>
          <PoweredByKnockIcon />
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
    paddingTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  branding: {
    alignItems: "center",
    paddingBottom: 20,
    zIndex: 1,
  },
  list: {
    flexGrow: 1,
  },
  listContainer: {
    paddingHorizontal: 0,
  },
  title: {
    marginBottom: 12,
  },
});
