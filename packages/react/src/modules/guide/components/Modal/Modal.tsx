import {
  ColorMode,
  UseInAppMessageOptions,
  useInAppMessage,
  useInAppMessagesChannel,
} from "@knocklabs/react-core";
import * as Dialog from "@radix-ui/react-dialog";
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

type RootProps = Omit<
  React.ComponentPropsWithoutRef<typeof Dialog.Root>,
  "modal"
> &
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>;

const Root = ({ children, onOpenChange, ...props }: RootProps) => {
  return (
    <Dialog.Root defaultOpen onOpenChange={onOpenChange} {...props}>
      <Dialog.Portal>{children}</Dialog.Portal>
    </Dialog.Root>
  );
};
Root.displayName = "ModalView.Root";

type OverlayProps = React.ComponentPropsWithoutRef<typeof Dialog.Overlay> &
  React.ComponentPropsWithRef<"div">;
type OverlayRef = React.ElementRef<"div">;

// TODO: Causes layout shift...
const Overlay = React.forwardRef<OverlayRef, OverlayProps>(
  ({ className, ...props }, forwardedRef) => {
    return (
      <Dialog.Overlay
        className={clsx("knock-guide-modal__overlay", className)}
        ref={forwardedRef}
        {...props}
      />
    );
  },
);
Overlay.displayName = "ModalView.Overlay";

type ContentProps = React.ComponentPropsWithoutRef<typeof Dialog.Content> &
  React.ComponentPropsWithRef<"div">;
type ContentRef = React.ElementRef<"div">;

const Content = React.forwardRef<ContentRef, ContentProps>(
  ({ children, className, ...props }, forwardedRef) => {
    return (
      <Dialog.Content
        className={clsx("knock-guide-modal", className)}
        ref={forwardedRef}
        {...props}
      >
        {children}
      </Dialog.Content>
    );
  },
);
Content.displayName = "ModalView.Content";

const Header: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-modal__header", className)} {...props}>
      {children}
    </div>
  );
};
Header.displayName = "ModalView.Header";

type TitleProps = React.ComponentPropsWithoutRef<typeof Dialog.Title> &
  React.ComponentPropsWithRef<"div"> & {
    title: string;
  };

const Title = ({ title, className, ...props }: TitleProps) => {
  return (
    <Dialog.Title
      className={clsx("knock-guide-modal__title", className)}
      {...props}
    >
      {title}
    </Dialog.Title>
  );
};
Title.displayName = "ModalView.Title";

const Body: React.FC<{ body: string } & React.ComponentPropsWithRef<"div">> = ({
  body,
  className,
  ...props
}) => {
  return (
    <Dialog.Description
      className={clsx("knock-guide-modal__body", className)}
      dangerouslySetInnerHTML={{ __html: body }}
      {...props}
    />
  );
};
Body.displayName = "ModalView.Body";

const Actions: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-modal__actions", className)} {...props}>
      {children}
    </div>
  );
};
Actions.displayName = "ModalView.Actions";

const PrimaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx("knock-guide-modal__action", className)}
      {...props}
    >
      {text}
    </a>
  );
};
PrimaryAction.displayName = "ModalView.PrimaryAction";

const SecondaryAction: React.FC<
  ActionContent & React.ComponentPropsWithRef<"a">
> = ({ text, action, className, ...props }) => {
  return (
    <a
      href={action}
      className={clsx(
        "knock-guide-modal__action knock-guide-modal__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </a>
  );
};
SecondaryAction.displayName = "ModalView.SecondaryAction";

type CloseProps = React.ComponentPropsWithoutRef<typeof Dialog.Close> &
  React.ComponentPropsWithRef<"button">;

const Close = ({ className, ...props }: CloseProps) => {
  return (
    <Dialog.Close
      className={clsx("knock-guide-modal__close", className)}
      {...props}
    >
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
    </Dialog.Close>
  );
};
Close.displayName = "ModalView.Close";

const DefaultView: React.FC<{
  content: ModalContent;
  colorMode?: ColorMode;
  onOpenChange?: (open: boolean) => void;
  onInteract?: () => void;
  onDismiss?: React.MouseEventHandler<HTMLButtonElement>;
}> = ({
  content,
  colorMode = "light",
  onOpenChange,
  onInteract,
  onDismiss,
}) => {
  return (
    <Root onOpenChange={onOpenChange} onClick={onInteract}>
      <Overlay />
      {/* Must pass color mode to content for css variables to be set properly */}
      <Content data-knock-color-mode={colorMode}>
        <Header>
          <Title title={content.title} />
          {content.dismissible && <Close onClick={onDismiss} />}
        </Header>

        <Body body={content.body} />

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
        </Actions>
      </Content>
    </Root>
  );
};
DefaultView.displayName = "ModalView.Default";

const Modal: React.FC<ModalProps> = ({ filters }) => {
  const { colorMode } = useInAppMessagesChannel();
  const { message, inAppMessagesClient } = useInAppMessage<ModalContent>(
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

  const onOpenChange = (open: boolean) => {
    if (!open) {
      inAppMessagesClient.markAsArchived(message);
    }
  };

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
      onOpenChange={onOpenChange}
      onDismiss={onDismiss}
      onInteract={onInteract}
    />
  );
};
Modal.displayName = "Modal";

const ModalView = {} as {
  Default: typeof DefaultView;
  Root: typeof Root;
  Overlay: typeof Overlay;
  Content: typeof Content;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  PrimaryAction: typeof PrimaryAction;
  SecondaryAction: typeof SecondaryAction;
  Close: typeof Close;
};

Object.assign(ModalView, {
  Default: DefaultView,
  Root,
  Overlay,
  Content,
  Title,
  Body,
  Actions,
  PrimaryAction,
  SecondaryAction,
  Close,
});

export { Modal, ModalView };
