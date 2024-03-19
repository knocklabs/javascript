import { Feed, FeedStoreState } from "@knocklabs/client";
import { useKnockFeed } from "@knocklabs/react-core";
import { Placement } from "@popperjs/core";
import React, { RefObject, useEffect } from "react";
import { usePopper } from "react-popper";

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
  const { colorMode, feedClient, useFeedStore } = useKnockFeed();
  const store = useFeedStore();

  const { ref: popperRef } = useComponentVisible(isVisible, onClose, {
    closeOnClickOutside,
  });

  const { styles, attributes } = usePopper(
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

  useEffect(() => {
    // Whenever the feed is opened, we want to invoke the `onOpen` callback
    // function to handle any side effects.
    if (isVisible && onOpen) {
      onOpen({ store, feedClient });
    }
  }, [isVisible, onOpen, store, feedClient]);

  return (
    <div
      className={`rnf-notification-feed-popover rnf-notification-feed-popover--${colorMode}`}
      style={{
        ...styles.popper,
        visibility: isVisible ? "visible" : "hidden",
        opacity: isVisible ? 1 : 0,
      }}
      ref={popperRef}
      {...attributes.popper}
      role="dialog"
      tabIndex={-1}
    >
      <div className="rnf-notification-feed-popover__inner">
        <NotificationFeed {...feedProps} />
      </div>
    </div>
  );
};
