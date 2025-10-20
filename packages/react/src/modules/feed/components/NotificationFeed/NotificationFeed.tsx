import { FeedItem, NetworkStatus, isRequestInFlight } from "@knocklabs/client";
import {
  ColorMode,
  FilterStatus,
  useFeedSettings,
  useKnockFeed,
  useTranslations,
} from "@knocklabs/react-core";
import { GenericData } from "@knocklabs/types";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { Spinner } from "../../../core/components/Spinner";
import useOnBottomScroll from "../../../core/hooks/useOnBottomScroll";
import { EmptyFeed } from "../EmptyFeed";
import { NotificationCell, NotificationCellProps } from "../NotificationCell";

import {
  NotificationFeedHeader,
  NotificationFeedHeaderProps,
} from "./NotificationFeedHeader";
import "./styles.css";

export type RenderItemProps<T = GenericData> = {
  item: FeedItem<T>;
  onItemClick?: NotificationCellProps["onItemClick"];
  onButtonClick?: NotificationCellProps["onButtonClick"];
};

export type RenderItem = (props: RenderItemProps) => ReactNode;

export type RenderLoadingProps = {
  colorMode: ColorMode;
};

export type RenderLoading = (props: RenderLoadingProps) => ReactNode;

export interface NotificationFeedProps {
  EmptyComponent?: ReactNode;
  /**
   * @deprecated Use `renderHeader` instead to accept `NotificationFeedHeaderProps`
   */
  header?: ReactNode;
  renderItem?: RenderItem;
  renderHeader?: (props: NotificationFeedHeaderProps) => ReactNode;
  onNotificationClick?: NotificationCellProps["onItemClick"];
  onNotificationButtonClick?: NotificationCellProps["onButtonClick"];
  onMarkAllAsReadClick?: (e: React.MouseEvent, unreadItems: FeedItem[]) => void;
  initialFilterStatus?: FilterStatus;
  renderLoading?: RenderLoading;
}

const defaultRenderItem = (props: RenderItemProps) => (
  <NotificationCell key={props.item.id} {...props} />
);

const defaultRenderHeader = (props: NotificationFeedHeaderProps) => (
  <NotificationFeedHeader {...props} />
);

const defaultRenderLoading = ({ colorMode }: { colorMode: ColorMode }) => (
  <div className="rnf-notification-feed__spinner-container">
    <Spinner
      thickness={3}
      size="16px"
      color={colorMode === "dark" ? "rgba(255, 255, 255, 0.65)" : undefined}
    />
  </div>
);

const poweredByKnockUrl =
  "https://knock.app?utm_source=powered-by-knock&utm_medium=referral&utm_campaign=knock-branding-feed";

export const NotificationFeed: React.FC<NotificationFeedProps> = ({
  EmptyComponent = <EmptyFeed />,
  renderItem = defaultRenderItem,
  onNotificationClick,
  onNotificationButtonClick,
  onMarkAllAsReadClick,
  initialFilterStatus = FilterStatus.All,
  header,
  renderHeader = defaultRenderHeader,
  renderLoading = defaultRenderLoading,
}) => {
  const [status, setStatus] = useState(initialFilterStatus);
  const { feedClient, useFeedStore, colorMode } = useKnockFeed();
  const { settings } = useFeedSettings(feedClient);
  const { t } = useTranslations();

  const { pageInfo, items, networkStatus } = useFeedStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatus(initialFilterStatus);
  }, [initialFilterStatus]);

  useEffect(() => {
    // When the feed client changes, or the status changes issue a re-fetch
    feedClient.fetch({ status });
  }, [feedClient, status]);

  const noItems = items.length === 0;
  const requestInFlight = isRequestInFlight(networkStatus);

  // Handle fetching more once we reach the bottom of the list
  const onBottomCallback = useCallback(() => {
    if (!requestInFlight && pageInfo.after) {
      feedClient.fetchNextPage();
    }
  }, [requestInFlight, pageInfo, feedClient]);

  // Once we scroll to the bottom of the view we want to automatically fetch
  // more items for the feed and bring them into the list
  useOnBottomScroll({
    ref: containerRef,
    callback: onBottomCallback,
    offset: 70,
  });

  return (
    <div
      className={`rnf-notification-feed rnf-notification-feed--${colorMode}`}
    >
      {header ||
        renderHeader({
          setFilterStatus: setStatus,
          filterStatus: status,
          onMarkAllAsReadClick,
        })}

      <div className="rnf-notification-feed__container" ref={containerRef}>
        {networkStatus === NetworkStatus.loading && (
          renderLoading({ colorMode })
        )}

        <div className="rnf-notification-feed__feed-items-container">
          {networkStatus !== NetworkStatus.loading &&
            items.map((item: FeedItem) =>
              renderItem({
                item,
                onItemClick: onNotificationClick,
                onButtonClick: onNotificationButtonClick,
              }),
            )}
        </div>

        {networkStatus === NetworkStatus.fetchMore && (
          renderLoading({ colorMode })
        )}

        {!requestInFlight && noItems && EmptyComponent}
      </div>

      {settings?.features.branding_required && (
        <div className="rnf-notification-feed__knock-branding">
          <a href={poweredByKnockUrl} target="_blank">
            {t("poweredBy") || "Powered by Knock"}
          </a>
        </div>
      )}
    </div>
  );
};
