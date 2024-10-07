import {
  ColorMode,
  UseInAppMessageOptions,
  useInAppChannel,
  useInAppMessage,
} from "@knocklabs/react-core";
import clsx from "clsx";
import React, { useEffect } from "react";

import { ActionContent } from "../types";

import "./styles.css";

const MESSAGE_TYPE = "modal";

export interface ModalProps {
  filters?: UseInAppMessageOptions;
}

export interface ModalContent {
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

// TODO: Use radix dialog to handle portal etc.
// TODO: Overlay

const Root: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-modal", className)} {...props}>
      {children}
    </div>
  );
};

const Content: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-modal__message", className)} {...props}>
      {children}
    </div>
  );
};

const Header: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-modal__header", className)} {...props}>
      {children}
    </div>
  );
};

const Title: React.FC<
  { title: string } & React.ComponentPropsWithRef<"div">
> = ({ title, className, ...props }) => {
  return (
    <div className={clsx("iam-modal__title", className)} {...props}>
      {title}
    </div>
  );
};

const Body: React.FC<{ body: string } & React.ComponentPropsWithRef<"div">> = ({
  body,
  className,
  ...props
}) => {
  return (
    <div className={clsx("iam-modal__body", className)} {...props}>
      {body}
    </div>
  );
};

const Actions: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-modal__actions", className)} {...props}>
      {children}
    </div>
  );
};

const PrimaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx("iam-modal__action", className)}
      {...props}
    >
      {text}
    </a>
  );
};

const SecondaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx(
        "iam-modal__action iam-modal__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </a>
  );
};

const DismissButton: React.FC<React.ComponentPropsWithRef<"button">> = ({
  className,
  ...props
}) => {
  return (
    <button className={clsx("iam-modal__close", className)} {...props}>
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

const DefaultView: React.FC<{
  content: ModalContent;
  colorMode?: ColorMode;
  onInteracted?: () => void;
  onDismissClick?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({ content, colorMode = "light", onInteracted, onDismissClick }) => {
  return (
    <Root
      data-knock-color-mode={colorMode}
      onClick={onInteracted}
      onFocus={onInteracted}
    >
      <Content>
        <Header>
          <Title title={content.title} />
          {content.dismissible && <DismissButton onClick={onDismissClick} />}
        </Header>

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

const Default: React.FC<ModalProps> = ({ filters }) => {
  const { colorMode } = useInAppChannel();
  const { message, inAppMessagesClient } = useInAppMessage<ModalContent>(
    MESSAGE_TYPE,
    filters,
  );

  // Mark the message as seen on render
  useEffect(() => {
    if (!message || message.seen_at !== null) return;

    inAppMessagesClient.markAsSeen(message);
  }, [message, inAppMessagesClient]);

  if (!message) return null;

  const onDismissClick = () => {
    inAppMessagesClient.markAsArchived(message);
  };

  const onInteracted = () => {
    inAppMessagesClient.markAsInteracted(message);
  };

  return (
    <DefaultView
      content={message.content}
      colorMode={colorMode}
      onDismissClick={onDismissClick}
      onInteracted={onInteracted}
    />
  );
};

const View = {} as {
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

Object.assign(View, {
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

const Modal = {} as {
  View: typeof View;
  Default: typeof Default;
};

// TODO: Consider how to structure these exports
Object.assign(Modal, {
  View,
  Default,
});

export { Modal };
