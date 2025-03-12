import { ColorMode } from "@knocklabs/react-core";
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

const MESSAGE_TYPE = "card";

const Root: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-card", className)} {...props}>
      {children}
    </div>
  );
};
Root.displayName = "CardView.Root";

const Content: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-card__message", className)} {...props}>
      {children}
    </div>
  );
};
Content.displayName = "CardView.Content";

const Header: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-card__header", className)} {...props}>
      {children}
    </div>
  );
};
Header.displayName = "CardView.Header";

const Headline: React.FC<
  { headline: string } & React.ComponentPropsWithRef<"div">
> = ({ headline, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-card__headline", className)} {...props}>
      {headline}
    </div>
  );
};
Headline.displayName = "CardView.Headline";

const Title: React.FC<
  { title: string } & React.ComponentPropsWithRef<"div">
> = ({ title, className, ...props }) => {
  return (
    <div className={clsx("knock-guide-card__title", className)} {...props}>
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
      className={clsx("knock-guide-card__body", className)}
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
    <div className={clsx("knock-guide-card__actions", className)} {...props}>
      {children}
    </div>
  );
};
Actions.displayName = "CardView.Actions";

const PrimaryButton: React.FC<
  ButtonContent & React.ComponentPropsWithRef<"button">
> = ({ text, action, className, ...props }) => {
  return (
    <button className={clsx("knock-guide-card__action", className)} {...props}>
      {text}
    </button>
  );
};
PrimaryButton.displayName = "CardView.PrimaryButton";

const SecondaryButton: React.FC<
  ButtonContent & React.ComponentPropsWithRef<"button">
> = ({ text, action, className, ...props }) => {
  return (
    <button
      className={clsx(
        "knock-guide-card__action knock-guide-card__action--secondary",
        className,
      )}
      {...props}
    >
      {text}
    </button>
  );
};
SecondaryButton.displayName = "CardView.SecondaryButton";

const DismissButton: React.FC<React.ComponentPropsWithRef<"button">> = ({
  className,
  ...props
}) => {
  return (
    <button className={clsx("knock-guide-card__close", className)} {...props}>
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

type CardContent = {
  headline: string;
  title: string;
  body: string;
  primary_button?: ButtonContent;
  secondary_button?: ButtonContent;
  dismissible?: boolean;
};

const DefaultView: React.FC<{
  content: CardContent;
  colorMode?: ColorMode;
  onDismiss?: () => void;
  onButtonClick?: (e: React.MouseEvent, button: TargetButton) => void;
}> = ({ content, colorMode = "light", onDismiss, onButtonClick }) => {
  return (
    <Root data-knock-color-mode={colorMode}>
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
      </Actions>
    </Root>
  );
};
DefaultView.displayName = "CardView.Default";

type CardProps = {
  guideKey?: string;
  onButtonClick?: (
    e: React.MouseEvent,
    target: TargetButtonWithGuideContext,
  ) => void;
};

export const Card: React.FC<CardProps> = ({ guideKey, onButtonClick }) => {
  return (
    <Guide filters={{ key: guideKey, type: MESSAGE_TYPE }}>
      {({ guide, step, colorMode, markAsInteracted, markAsArchived }) => (
        <DefaultView
          content={step.content as CardContent}
          colorMode={colorMode}
          onDismiss={markAsArchived}
          onButtonClick={(e, button) => {
            const metadata = { ...button, type: "button_click" };
            markAsInteracted({ metadata });

            return onButtonClick
              ? onButtonClick(e, { button, step, guide })
              : maybeNavigateToUrlWithDelay(button.action);
          }}
        />
      )}
    </Guide>
  );
};
Card.displayName = "Card";

export const CardView = {} as {
  Default: typeof DefaultView;
  Root: typeof Root;
  Content: typeof Content;
  Headline: typeof Headline;
  Title: typeof Title;
  Body: typeof Body;
  Actions: typeof Actions;
  PrimaryButton: typeof PrimaryButton;
  SecondaryButton: typeof SecondaryButton;
  DismissButton: typeof DismissButton;
};

Object.assign(CardView, {
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
