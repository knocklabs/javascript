import React, { SyntheticEvent } from "react";
import { BellIcon } from "../../../core/components/Icons";
import { useKnockFeed } from "@knocklabs/react-core";
import { BadgeCountType, UnseenBadge } from "../UnseenBadge";

import "./styles.css";

export interface NotificationIconButtonProps {
  // What value should we use to drive the badge count?
  badgeCountType?: BadgeCountType;
  onClick: (e: SyntheticEvent) => void;
}

export const NotificationIconButton = React.forwardRef<
  HTMLButtonElement,
  NotificationIconButtonProps
>(({ onClick, badgeCountType }, ref) => {
  const { colorMode } = useKnockFeed();

  return (
    <button
      className={`rnf-notification-icon-button rnf-notification-icon-button--${colorMode}`}
      role="button"
      aria-label="Open notification feed"
      ref={ref}
      onClick={onClick}
    >
      <BellIcon />
      <UnseenBadge badgeCountType={badgeCountType} />
    </button>
  );
});
