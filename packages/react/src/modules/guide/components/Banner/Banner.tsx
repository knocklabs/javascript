import { ColorMode, useGuide } from "@knocklabs/react-core";
import clsx from "clsx";
import React from "react";

import { maybeNavigateToUrlWithDelay } from "../helpers";
import {
  ButtonContent,
  TargetButton,
  TargetButtonWithGuideContext,
} from "../types";

import "./styles.css";

const MESSAGE_TYPE = "banner";

const Root: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-banner", className)} {...props}>
      {children}
    </div>
  );
};
Root.displayName = "BannerView.Root";

const Content: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-banner__message", className)} {...props}>
      {children}
    </div>
  );
};
Content.displayName = "BannerView.Content";

const Title: React.FC<
  { title: string } & React.ComponentPropsWithRef<"div">
> = ({ title, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-banner__title", className)} {...props}>
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
      className={clsx("knock-guide-banner__body", className)}
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
    <div className={clsx("knock-guide-banner__actions", className)} {...props}>
      {children}
    </div>
  );
};
Actions.displayName = "BannerView.Actions";

const PrimaryButton: React.FC<
  ButtonContent & React.ComponentPropsWithRef<"button">
> = ({ text, action, className, ...props }) => {
  return (
    <button
      className={clsx("knock-guide-banner__action", className)}
      {...props}
    >
      {text}
    </button>
  );
};
PrimaryButton.displayName = "BannerView.PrimaryButton";

const SecondaryButton: React.FC<
  ButtonContent & React.ComponentPropsWithRef<"button">
> = ({ text, action, className, ...props }) => {
  return (
    <button
      className={clsx(
        "knock-guide-banner__action knock-guide-banner__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </button>
  );
};
SecondaryButton.displayName = "BannerView.SecondaryButton";

const DismissButton: React.FC<React.ComponentPropsWithRef<"button">> = ({
  className,
  ...props
}) => {
  return (
    <button className={clsx("knock-guide-banner__close", className)} {...props}>
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

type BannerContent = {
  title: string;
  body: string;
  primary_button?: ButtonContent;
  secondary_button?: ButtonContent;
  dismissible?: boolean;
};

const DefaultView: React.FC<{
  content: BannerContent;
  colorMode?: ColorMode;
  onDismiss?: () => void;
  onButtonClick?: (e: React.MouseEvent, button: TargetButton) => void;
}> = ({ content, colorMode = "light", onDismiss, onButtonClick }) => {
  return (
    <Root data-knock-color-mode={colorMode}>
      <Content>
        <Title title={content.title} />
        <Body body={content.body} />
      </Content>
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

        {content.dismissible && <DismissButton onClick={onDismiss} />}
      </Actions>
    </Root>
  );
};
DefaultView.displayName = "BannerView.Default";

type BannerProps = {
  guideKey?: string;
  onButtonClick?: (
    e: React.MouseEvent,
    target: TargetButtonWithGuideContext,
  ) => void;
};

export const Banner: React.FC<BannerProps> = ({ guideKey, onButtonClick }) => {
  const { guide, step, colorMode } = useGuide({
    key: guideKey,
    type: MESSAGE_TYPE,
  });

  React.useEffect(() => {
    if (step) step.markAsSeen();
  }, [step]);

  if (!guide || !step) return null;

  return (
    <DefaultView
      content={step.content as BannerContent}
      colorMode={colorMode}
      onDismiss={() => step.markAsArchived()}
      onButtonClick={(e, button) => {
        const metadata = { ...button, type: "button_click" };
        step.markAsInteracted({ metadata });

        return onButtonClick
          ? onButtonClick(e, { button, step, guide })
          : maybeNavigateToUrlWithDelay(button.action);
      }}
    />
  );
};
Banner.displayName = "Banner";

export const BannerView = {} as {
  Default: typeof DefaultView;
  Root: typeof Root;
  Content: typeof Content;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  PrimaryButton: typeof PrimaryButton;
  SecondaryButton: typeof SecondaryButton;
  DismissButton: typeof DismissButton;
};

Object.assign(BannerView, {
  Default: DefaultView,
  Root,
  Content,
  Title,
  Body,
  Actions,
  PrimaryButton,
  SecondaryButton,
  DismissButton,
});
