import { FeedItem } from "@knocklabs/client";
import {
  useKnockFeed,
  useNotificationStore,
  useTranslations,
} from "@knocklabs/react-core";
import * as React from "react";

import { CheckmarkCircle } from "../../../core/components/Icons";

import "./styles.css";

export type MarkAsReadProps = {
  onClick?: (e: React.MouseEvent, unreadItems: FeedItem[]) => void;
};

export const MarkAsRead: React.FC<MarkAsReadProps> = ({ onClick }) => {
  const { feedClient, colorMode } = useKnockFeed();
  const { t } = useTranslations();

  const unreadItems = useNotificationStore(feedClient, (state) =>
    state.items.filter((item) => !item.read_at),
  );

  const unreadCount = useNotificationStore(
    feedClient,
    (state) => state.metadata.unread_count,
  );

  const onClickHandler = React.useCallback(
    (e: React.MouseEvent) => {
      feedClient.markAllAsRead();
      if (onClick) onClick(e, unreadItems);
    },
    [feedClient, unreadItems, onClick],
  );

  return (
    <button
      className={`rnf-mark-all-as-read rnf-mark-all-as-read--${colorMode}`}
      disabled={unreadCount === 0}
      onClick={onClickHandler}
      type="button"
    >
      {t("markAllAsRead")}
      <CheckmarkCircle />
    </button>
  );
};
