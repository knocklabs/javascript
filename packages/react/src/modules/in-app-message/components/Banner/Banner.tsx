import { UseInAppMessageOptions, useInAppMessage } from "@knocklabs/react-core";
import clsx from "clsx";
import React from "react";

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
  dismissible: boolean;
}

const Root: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-banner", className)} {...props}>
      {children}
    </div>
  );
};

const Content: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-banner__message", className)} {...props}>
      {children}
    </div>
  );
};

const Title: React.FC<
  { title: string } & React.ComponentPropsWithRef<"div">
> = ({ title, className, ...props }) => {
  return (
    <div className={clsx("iam-banner__title", className)} {...props}>
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
    <div className={clsx("iam-banner__body", className)} {...props}>
      {body}
    </div>
  );
};

const Actions: React.FC<
  React.PropsWithChildren<React.ComponentPropsWithRef<"div">>
> = ({ children, className, ...props }) => {
  return (
    <div className={clsx("iam-banner__actions", className)} {...props}>
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
      className={clsx("iam-banner__action", className)}
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
        "iam-banner__action iam-banner__action--secondary",
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
    <button className={clsx("iam-banner__close", className)} {...props}>
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

const DefaultView: React.FC<{ content: BannerContent }> = ({ content }) => {
  return (
    <Root>
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

        {content.dismissible && (
          // TODO: Archive message on click
          <DismissButton />
        )}
      </Actions>
    </Root>
  );
};

const Default: React.FC<BannerProps> = ({ filters }) => {
  const { message } = useInAppMessage<BannerContent>(MESSAGE_TYPE, filters);

  if (!message) return null;

  // TODO: Track interaction on load or whatever other events necessary

  return <DefaultView content={message.content} />;
};

const View = {} as {
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
  Root,
  Content,
  Title,
  Body,
  Actions,
  PrimaryAction,
  SecondaryAction,
  DismissButton,
});

const Banner = {} as {
  View: typeof View;
  Default: typeof Default;
};

// TODO: Consider how to structure these exports
Object.assign(Banner, {
  View,
  Default,
});

export { Banner };
