import { FeedItem } from "@knocklabs/client";
import { useKnockFeed, useTranslations } from "@knocklabs/react-core";
import * as React from "react";
import { useShallow } from "zustand/shallow";

import { CheckmarkCircle } from "../../../core/components/Icons";

import "./styles.css";

export type MarkAsReadProps = {
  onClick?: (e: React.MouseEvent, unreadItems: FeedItem[]) => void;
};

export const MarkAsRead: React.FC<MarkAsReadProps> = ({ onClick }) => {
  const { useFeedStore, feedClient, colorMode } = useKnockFeed();
  const { t } = useTranslations();

  // Without useShallow, the component will get itself in a re-render loop
  // https://zustand.docs.pmnd.rs/guides/prevent-rerenders-with-use-shallow
  const unreadItems = useFeedStore(
    useShallow((state) => state.items.filter((item) => !item.read_at)),
  );

  const unreadCount = useFeedStore((state) => state.metadata.unread_count);

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
      <CheckmarkCircle aria-hidden />
    </button>
  );
};
