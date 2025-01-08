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

const MESSAGE_TYPE = "card";

export interface CardProps {
  filters?: UseInAppMessageOptions;
}

export interface CardContent {
  headline: string;
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
    <div className={clsx("knock-iam-card", className)} {...props}>
      {children}
    </div>
  );
};
Root.displayName = "CardView.Root";

const Content: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-card__message", className)} {...props}>
      {children}
    </div>
  );
};
Content.displayName = "CardView.Content";

const Header: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-card__header", className)} {...props}>
      {children}
    </div>
  );
};
Header.displayName = "CardView.Header";

const Headline: React.FC<
  { headline: string } & React.ComponentPropsWithRef<"div">
> = ({ headline, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-card__headline", className)} {...props}>
      {headline}
    </div>
  );
};
Headline.displayName = "CardView.Headline";

const Title: React.FC<
  { title: string } & React.ComponentPropsWithRef<"div">
> = ({ title, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-card__title", className)} {...props}>
      {title}
    </div>
  );
};
Title.displayName = "CardView.Title";

const Body: React.FC<{ body: string } & React.ComponentPropsWithRef<"div">> = ({
  body,
  className,
  ...props
}) => {
  return (
    <div
      className={clsx("knock-iam-card__body", className)}
      dangerouslySetInnerHTML={{ __html: body }}
      {...props}
    />
  );
};
Body.displayName = "CardView.Body";

const Actions: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-iam-card__actions", className)} {...props}>
      {children}
    </div>
  );
};
Actions.displayName = "CardView.Actions";

const PrimaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx("knock-iam-card__action", className)}
      {...props}
    >
      {text}
    </a>
  );
};
PrimaryAction.displayName = "CardView.PrimaryAction";

const SecondaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx(
        "knock-iam-card__action knock-iam-card__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </a>
  );
};
SecondaryAction.displayName = "CardView.SecondaryAction";

const DismissButton: React.FC<React.ComponentPropsWithRef<"button">> = ({
  className,
  ...props
}) => {
  return (
    <button className={clsx("knock-iam-card__close", className)} {...props}>
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
DismissButton.displayName = "CardView.DismissButton";

const DefaultView: React.FC<{
  content: CardContent;
  colorMode?: ColorMode;
  onInteract?: () => void;
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ content, colorMode = "light", onInteract, onDismiss }) => {
  return (
    <Root data-knock-color-mode={colorMode} onClick={onInteract}>
      <Content>
        <Header>
          <Headline headline={content.headline} />
          {content.dismissible && <DismissButton onClick={onDismiss} />}
        </Header>

        <Title title={content.title} />
        <Body body={content.body} />
      </Content>
      <Actions>
        {content.primary_button && (
          <PrimaryAction
            text={content.primary_button.text}
            action={content.primary_button.action}
          />
        )}

        {content.secondary_button && (
          <SecondaryAction
            text={content.secondary_button.text}
            action={content.secondary_button.action}
          />
        )}
      </Actions>
    </Root>
  );
};
DefaultView.displayName = "CardView.Default";

const Card: React.FC<CardProps> = ({ filters }) => {
  const { colorMode } = useInAppMessagesChannel();
  const { message, inAppMessagesClient } = useInAppMessage<CardContent>(
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
Card.displayName = "Card";

const CardView = {} as {
  Default: typeof DefaultView;
  Root: typeof Root;
  Content: typeof Content;
  Headline: typeof Headline;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  PrimaryAction: typeof PrimaryAction;
  SecondaryAction: typeof SecondaryAction;
  DismissButton: typeof DismissButton;
};

Object.assign(CardView, {
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

export { Card, CardView };
