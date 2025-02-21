import { Feed, FeedStoreState } from "@knocklabs/client";
import { useKnockFeed, useTranslations } from "@knocklabs/react-core";
import { Placement, createPopper } from "@popperjs/core";
import React, { RefObject, useEffect } from "react";

import useComponentVisible from "../../../core/hooks/useComponentVisible";
import { NotificationFeed, NotificationFeedProps } from "../NotificationFeed";

import "./styles.css";

type OnOpenOptions = {
  store: FeedStoreState;
  feedClient: Feed;
};

const defaultOnOpen = ({ store, feedClient }: OnOpenOptions) => {
  if (store.metadata.unseen_count > 0) {
    feedClient.markAllAsSeen();
  }
};

export interface NotificationFeedPopoverProps extends NotificationFeedProps {
  isVisible: boolean;
  onOpen?: (arg: OnOpenOptions) => void;
  onClose: (e: Event) => void;
  buttonRef: RefObject<HTMLElement>;
  closeOnClickOutside?: boolean;
  placement?: Placement;
}

export const NotificationFeedPopover: React.FC<
  NotificationFeedPopoverProps
> = ({
  isVisible,
  onOpen = defaultOnOpen,
  onClose,
  buttonRef,
  closeOnClickOutside = true,
  placement = "bottom-end",
  ...feedProps
}) => {
  const { t } = useTranslations();
  const { colorMode, feedClient, useFeedStore } = useKnockFeed();
  const store = useFeedStore();

  const { ref: popperRef } = useComponentVisible(isVisible, onClose, {
    closeOnClickOutside,
  });

  useEffect(() => {
    // Whenever the feed is opened, we want to invoke the `onOpen` callback
    // function to handle any side effects.
    if (isVisible && onOpen) {
      onOpen({ store, feedClient });
    }
  }, [isVisible, onOpen, store, feedClient]);

  useEffect(() => {
    if (buttonRef.current && popperRef.current) {
      const popperInstance = createPopper(
        buttonRef.current,
        popperRef.current,
        {
          strategy: "fixed",
          placement,
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 8],
              },
            },
          ],
        },
      );

      // Cleanup
      return () => {
        popperInstance.destroy();
      };
    }
  }, [buttonRef, popperRef, placement]);

  return (
    <div
      className={`rnf-notification-feed-popover rnf-notification-feed-popover--${colorMode}`}
      style={{
        visibility: isVisible ? "visible" : "hidden",
        opacity: isVisible ? 1 : 0,
      }}
      ref={popperRef}
      role="dialog"
      aria-label={t("notifications")}
      tabIndex={-1}
    >
      <div className="rnf-notification-feed-popover__inner">
        <NotificationFeed {...feedProps} />
      </div>
    </div>
  );
};
