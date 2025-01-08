import {
  ColorMode,
  UseInAppMessageOptions,
  useInAppMessage,
  useInAppMessagesChannel,
} from "@knocklabs/react-core";
import clsx from "clsx";
import React, { useEffect } from "react";

import { ActionContent } from "../types";

import "./styles.css";

const MESSAGE_TYPE = "banner";

export interface BannerProps {
  filters?: UseInAppMessageOptions;
}

export interface BannerContent {
  title: string;
  body: string;
  primary_button?: {
    text: string;
    action: string;
  };
  secondary_button?: {
    text: string;
    action: string;
  };
  dismissible?: boolean;
}

const Root: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-banner", className)} {...props}>
      {children}
    </div>
  );
};
Root.displayName = "BannerView.Root";

const Content: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-banner__message", className)} {...props}>
      {children}
    </div>
  );
};
Content.displayName = "BannerView.Content";

const Title: React.FC<
  { title: string } & React.ComponentPropsWithRef<"div">
> = ({ title, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-banner__title", className)} {...props}>
      {title}
    </div>
  );
};
Title.displayName = "BannerView.Title";

const Body: React.FC<{ body: string } & React.ComponentPropsWithRef<"div">> = ({
  body,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx("knock-iam-banner__body", className)}
      dangerouslySetInnerHTML={{ __html: body }}
      {...props}
    />
  );
};
Body.displayName = "BannerView.Body";

const Actions: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-banner__actions", className)} {...props}>
      {children}
    </div>
  );
};
Actions.displayName = "BannerView.Actions";

const PrimaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx("knock-iam-banner__action", className)}
      {...props}
    >
      {text}
    </a>
  );
};
PrimaryAction.displayName = "BannerView.PrimaryAction";

const SecondaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx(
        "knock-iam-banner__action knock-iam-banner__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </a>
  );
};
SecondaryAction.displayName = "BannerView.SecondaryAction";

const DismissButton: React.FC<React.ComponentPropsWithRef<"button">> = ({
  className,
  ...props
}) => {
  return (
    <button className={clsx("knock-iam-banner__close", className)} {...props}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        fill="none"
      >
        <g fill="#60646C" fillRule="evenodd" clipRule="evenodd">
          <path d="M14.03 3.97a.75.75 0 0 1 0 1.06l-9 9a.75.75 0 0 1-1.06-1.06l9-9a.75.75 0 0 1 1.06 0Z" />
          <path d="M3.97 3.97a.75.75 0 0 1 1.06 0l9 9a.75.75 0 1 1-1.06 1.06l-9-9a.75.75 0 0 1 0-1.06Z" />
        </g>
      </svg>
    </button>
  );
};
DismissButton.displayName = "BannerView.DismissButton";

const DefaultView: React.FC<{
  content: BannerContent;
  colorMode?: ColorMode;
  onInteract?: () => void;
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ content, colorMode = "light", onInteract, onDismiss }) => {
  return (
    <Root data-knock-color-mode={colorMode} onClick={onInteract}>
      <Content>
        <Title title={content.title} />
        <Body body={content.body} />
      </Content>
      <Actions>
        {content.secondary_button && (
          <SecondaryAction
            text={content.secondary_button.text}
            action={content.secondary_button.action}
          />
        )}

        {content.primary_button && (
          <PrimaryAction
            text={content.primary_button.text}
            action={content.primary_button.action}
          />
        )}

        {content.dismissible && <DismissButton onClick={onDismiss} />}
      </Actions>
    </Root>
  );
};
DefaultView.displayName = "BannerView.Default";

const Banner: React.FC<BannerProps> = ({ filters }) => {
  const { colorMode } = useInAppMessagesChannel();

  const { message, inAppMessagesClient } = useInAppMessage<BannerContent>(
    MESSAGE_TYPE,
    filters,
  );

  // Mark the message as seen on render
  useEffect(() => {
    if (!message || message.seen_at !== null) return;

    inAppMessagesClient.markAsSeen(message);
  }, [message, inAppMessagesClient]);

  // Exclude archived messages
  if (!message || message.archived_at) return null;

  const onDismiss = () => {
    inAppMessagesClient.markAsArchived(message);
  };

  const onInteract = () => {
    inAppMessagesClient.markAsInteracted(message);
  };

  return (
    <DefaultView
      content={message.content}
      colorMode={colorMode}
      onDismiss={onDismiss}
      onInteract={onInteract}
    />
  );
};
Banner.displayName = "Banner";

const BannerView = {} as {
  Default: typeof DefaultView;
  Root: typeof Root;
  Content: typeof Content;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  PrimaryAction: typeof PrimaryAction;
  SecondaryAction: typeof SecondaryAction;
  DismissButton: typeof DismissButton;
};

Object.assign(BannerView, {
  Default: DefaultView,
  Root,
  Content,
  Title,
  Body,
  Actions,
  PrimaryAction,
  SecondaryAction,
  DismissButton,
});

export { Banner, BannerView };
