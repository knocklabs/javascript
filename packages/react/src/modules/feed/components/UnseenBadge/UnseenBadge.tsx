import { FeedMetadata } from "@knocklabs/client";
import {
  type BadgeCountType,
  formatBadgeCount,
  getBadgeAriaLabel,
  useKnockFeed,
} from "@knocklabs/react-core";
import React from "react";

import "./styles.css";

export type UnseenBadgeProps = {
  badgeCountType?: BadgeCountType;
};

function selectBadgeCount(
  badgeCountType: BadgeCountType,
  metadata: FeedMetadata,
): number {
  switch (badgeCountType) {
    case "all":
      return metadata.total_count;
    case "unread":
      return metadata.unread_count;
    case "unseen":
      return metadata.unseen_count;
  }
}

export const UnseenBadge: React.FC<UnseenBadgeProps> = ({
  badgeCountType = "unseen",
}) => {
  const { useFeedStore } = useKnockFeed();
  const badgeCountValue = useFeedStore((state) =>
    selectBadgeCount(badgeCountType, state.metadata),
  );

  return badgeCountValue !== 0 ? (
    <div
      className="rnf-unseen-badge"
      role="status"
      aria-label={getBadgeAriaLabel(badgeCountValue, badgeCountType)}
    >
      <span className="rnf-unseen-badge__count" aria-hidden="true">
        {formatBadgeCount(badgeCountValue)}
      </span>
    </div>
  ) : null;
};
