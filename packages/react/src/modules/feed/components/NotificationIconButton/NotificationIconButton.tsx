import { useKnockFeed } from "@knocklabs/react-core";
import React, { SyntheticEvent } from "react";

import { BellIcon } from "../../../core/components/Icons";
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
      aria-label="Open notification feed"
      ref={ref}
      onClick={onClick}
    >
      <BellIcon aria-hidden />
      <UnseenBadge badgeCountType={badgeCountType} />
    </button>
  );
});
