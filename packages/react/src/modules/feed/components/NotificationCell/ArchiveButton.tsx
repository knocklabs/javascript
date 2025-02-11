import { FeedItem } from "@knocklabs/client";
import { useKnockFeed, useTranslations } from "@knocklabs/react-core";
import React, { MouseEvent, useCallback } from "react";
import { usePopperTooltip } from "react-popper-tooltip";

import { CloseCircle } from "../../../core/components/Icons";

export interface ArchiveButtonProps {
  item: FeedItem;
}

const ArchiveButton: React.FC<ArchiveButtonProps> = ({ item }) => {
  const { colorMode, feedClient } = useKnockFeed();
  const { t } = useTranslations();

  const onClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      feedClient.markAsArchived(item);
    },
    // TODO: Check if we can remove this disable
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [item],
  );

  const { getTooltipProps, setTooltipRef, setTriggerRef, visible } =
    usePopperTooltip({ placement: "top-end" });

  return (
    <button
      ref={setTriggerRef}
      onClick={onClick}
      type="button"
      aria-label={t("archiveNotification")}
      className={`rnf-archive-notification-btn rnf-archive-notification-btn--${colorMode}`}
    >
      <CloseCircle aria-hidden />

      {visible && (
        <div
          ref={setTooltipRef}
          {...getTooltipProps({
            className: `rnf-tooltip rnf-tooltip--${colorMode}`,
          })}
        >
          {t("archiveNotification")}
        </div>
      )}
    </button>
  );
};

export { ArchiveButton };
