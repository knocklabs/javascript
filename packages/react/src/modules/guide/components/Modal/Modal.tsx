import { ColorMode } from "@knocklabs/react-core";
import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import React from "react";

import { Guide } from "../Guide";
import { maybeNavigateToUrlWithDelay } from "../helpers";
import {
  ButtonContent,
  TargetButton,
  TargetButtonWithGuideContext,
} from "../types";

import "./styles.css";

const MESSAGE_TYPE = "modal";

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

const PrimaryButton: React.FC<
  ButtonContent & React.ComponentPropsWithRef<"button">
> = ({ text, action, className, ...props }) => {
  return (
    <button className={clsx("knock-guide-modal__action", className)} {...props}>
      {text}
    </button>
  );
};
PrimaryButton.displayName = "ModalView.PrimaryButton";

const SecondaryButton: React.FC<
  ButtonContent & React.ComponentPropsWithRef<"button">
> = ({ text, action, className, ...props }) => {
  return (
    <button
      className={clsx(
        "knock-guide-modal__action knock-guide-modal__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </button>
  );
};
SecondaryButton.displayName = "ModalView.SecondaryButton";

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

type ModalContent = {
  title: string;
  body: string;
  primary_button?: ButtonContent;
  secondary_button?: ButtonContent;
  dismissible?: boolean;
};

const DefaultView: React.FC<{
  content: ModalContent;
  colorMode?: ColorMode;
  onOpenChange?: (open: boolean) => void;
  onDismiss?: () => void;
  onButtonClick?: (e: React.MouseEvent, button: TargetButton) => void;
}> = ({
  content,
  colorMode = "light",
  onOpenChange,
  onDismiss,
  onButtonClick,
}) => {
  return (
    <Root onOpenChange={onOpenChange}>
      <Overlay />
      {/* Must pass color mode to content for css variables to be set properly */}
      <Content
        data-knock-color-mode={colorMode}
        onPointerDownOutside={onDismiss}
      >
        <Header>
          <Title title={content.title} />
          {content.dismissible && <Close onClick={onDismiss} />}
        </Header>

        <Body body={content.body} />

        <Actions>
          {content.secondary_button && (
            <SecondaryButton
              text={content.secondary_button.text}
              action={content.secondary_button.action}
              onClick={(e) => {
                if (onButtonClick) {
                  const { text, action } = content.secondary_button!;
                  onButtonClick(e, { name: "secondary_button", text, action });
                }
              }}
            />
          )}
          {content.primary_button && (
            <PrimaryButton
              text={content.primary_button.text}
              action={content.primary_button.action}
              onClick={(e) => {
                if (onButtonClick) {
                  const { text, action } = content.primary_button!;
                  onButtonClick(e, { name: "primary_button", text, action });
                }
              }}
            />
          )}
        </Actions>
      </Content>
    </Root>
  );
};
DefaultView.displayName = "ModalView.Default";

type ModalProps = {
  guideKey?: string;
  onButtonClick?: (
    e: React.MouseEvent,
    target: TargetButtonWithGuideContext,
  ) => void;
};

export const Modal: React.FC<ModalProps> = ({ guideKey, onButtonClick }) => {
  return (
    <Guide filters={{ key: guideKey, type: MESSAGE_TYPE }}>
      {({ guide, step, colorMode, onDismiss, onInteract }) => (
        <DefaultView
          content={step.content as ModalContent}
          colorMode={colorMode}
          onDismiss={onDismiss}
          onButtonClick={(e, button) => {
            onInteract({ ...button, type: "button_click" });

            return onButtonClick
              ? onButtonClick(e, { button, step, guide })
              : maybeNavigateToUrlWithDelay(button.action);
          }}
        />
      )}
    </Guide>
  );
};
Modal.displayName = "Modal";

export const ModalView = {} as {
  Default: typeof DefaultView;
  Root: typeof Root;
  Overlay: typeof Overlay;
  Content: typeof Content;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  PrimaryButton: typeof PrimaryButton;
  SecondaryButton: typeof SecondaryButton;
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
  PrimaryButton,
  SecondaryButton,
  Close,
});
