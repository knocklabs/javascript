import {
  ActionButton,
  ButtonSetContentBlock,
  ContentBlock,
  FeedItem,
  MarkdownContentBlock,
  TextContentBlock,
} from "@knocklabs/client";
import {
  formatTimestamp,
  renderNodeOrFallback,
  useKnockFeed,
  useTranslations,
} from "@knocklabs/react-core";
import React, { ReactNode, useMemo } from "react";

import { Button, ButtonGroup } from "../../../core";

import { ArchiveButton } from "./ArchiveButton";
import { Avatar } from "./Avatar";
import "./styles.css";

export interface NotificationCellProps {
  item: FeedItem;
  // Invoked when the outer container is clicked
  onItemClick?: (item: FeedItem) => void;
  // Invoked when a button in the notification cell is clicked
  onButtonClick?: (item: FeedItem, action: ActionButton) => void;
  avatar?: ReactNode;
  children?: ReactNode;
  archiveButton?: ReactNode;
}

type BlockByName = {
  [name: string]: ContentBlock;
};

function maybeNavigateToUrlWithDelay(url?: string) {
  if (url && url !== "") {
    setTimeout(() => window.location.assign(url), 200);
  }
}

export const NotificationCell = React.forwardRef<
  HTMLDivElement,
  NotificationCellProps
>(
  (
    { item, onItemClick, onButtonClick, avatar, children, archiveButton },
    ref,
  ) => {
    const { feedClient, colorMode } = useKnockFeed();
    const { locale } = useTranslations();

    const blocksByName: BlockByName = useMemo(() => {
      return item.blocks.reduce((acc, block) => {
        return { ...acc, [block.name]: block };
      }, {});
    }, [item]);

    const actionUrl = (blocksByName.action_url as TextContentBlock)?.rendered;
    const buttonSet = blocksByName.actions as ButtonSetContentBlock;

    const onContainerClickHandler = React.useCallback(() => {
      // Mark as interacted + read once we click the item
      feedClient.markAsInteracted(item, {
        type: "cell_click",
        action: actionUrl,
      });

      if (onItemClick) return onItemClick(item);

      return maybeNavigateToUrlWithDelay(actionUrl);
    }, [item, actionUrl, onItemClick, feedClient]);

    const onButtonClickHandler = React.useCallback(
      (_e: React.MouseEvent, button: ActionButton) => {
        // Record the interaction with the metadata for the button that was clicked
        feedClient.markAsInteracted(item, {
          type: "button_click",
          name: button.name,
          label: button.label,
          action: button.action,
        });

        if (onButtonClick) return onButtonClick(item, button);

        return maybeNavigateToUrlWithDelay(button.action);
      },
      [onButtonClick, feedClient, item],
    );

    const onKeyDown = React.useCallback(
      (ev: React.KeyboardEvent<HTMLDivElement>) => {
        switch (ev.key) {
          case "Enter": {
            ev.stopPropagation();
            onContainerClickHandler();
            break;
          }
          default:
            break;
        }
      },
      [onContainerClickHandler],
    );

    const actor = item.actors[0];

    return (
      <div
        ref={ref}
        className={`rnf-notification-cell rnf-notification-cell--${colorMode}`}
        onClick={onContainerClickHandler}
        onKeyDown={onKeyDown}
        tabIndex={0}
      >
        <div className="rnf-notification-cell__inner">
          {!item.read_at && (
            <div className="rnf-notification-cell__unread-dot" />
          )}

          {renderNodeOrFallback(
            avatar,
            actor && "name" in actor && actor.name && (
              <Avatar name={actor.name} src={actor.avatar} />
            ),
          )}

          <div className="rnf-notification-cell__content-outer">
            {blocksByName.body && (
              <div
                className="rnf-notification-cell__content"
                dangerouslySetInnerHTML={{
                  __html: (blocksByName.body as MarkdownContentBlock).rendered,
                }}
              />
            )}

            {buttonSet && (
              <div className="rnf-notification-cell__button-group">
                <ButtonGroup>
                  {buttonSet.buttons.map((button, i) => (
                    <Button
                      variant={i === 0 ? "primary" : "secondary"}
                      key={button.name}
                      onClick={(e) => onButtonClickHandler(e, button)}
                    >
                      {button.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </div>
            )}

            {children && (
              <div className="rnf-notification-cell__child-content">
                {children}
              </div>
            )}

            <span className="rnf-notification-cell__timestamp">
              {formatTimestamp(item.inserted_at, { locale })}
            </span>
          </div>

          {renderNodeOrFallback(archiveButton, <ArchiveButton item={item} />)}
        </div>
      </div>
    );
  },
);
