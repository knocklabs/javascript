import { MouseEvent, useCallback, useState, useRef, useEffect } from "react";
import { FeedItem } from "@knocklabs/client";
import { useKnockFeed, useTranslations } from "@knocklabs/react-core";
import { createPopper } from "@popperjs/core";

import { CloseCircle } from "../../../core/components/Icons";

export interface ArchiveButtonProps {
  item: FeedItem;
}

const ArchiveButton: React.FC<ArchiveButtonProps> = ({ item }) => {
  const { colorMode, feedClient } = useKnockFeed();
  const { t } = useTranslations();
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (triggerRef.current && tooltipRef.current && visible) {
      const popperInstance = createPopper(triggerRef.current, tooltipRef.current, {
        placement: "top-end",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ],
      });

      return () => {
        popperInstance.destroy();
      };
    }
  }, [visible]);

  return (
    <button
      ref={triggerRef}
      onClick={onClick}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      type="button"
      aria-label={t("archiveNotification")}
      className={`rnf-archive-notification-btn rnf-archive-notification-btn--${colorMode}`}
    >
      <CloseCircle aria-hidden />

      {visible && (
        <div
          ref={tooltipRef}
          className={`rnf-tooltip rnf-tooltip--${colorMode}`}
        >
          {t("archiveNotification")}
        </div>
      )}
    </button>
  );
};

export { ArchiveButton };
