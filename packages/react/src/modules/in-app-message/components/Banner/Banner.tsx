import { UseInAppMessageOptions, useInAppMessage } from "@knocklabs/react-core";
import React from "react";

import "./styles.css";

export interface BannerProps {
  filters?: UseInAppMessageOptions;
}

const MESSAGE_TYPE = "banner";

interface BannerContent {
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

export const Banner: React.FC<BannerProps> = ({ filters }) => {
  const { message } = useInAppMessage<BannerContent>(MESSAGE_TYPE, filters);

  if (!message) return null;

  // TODO: Track interaction on load or whatever other events necessary

  return (
    <div className="knk-banner">
      <div className="knk-banner__message">
        <div className="knk-banner__title">{message.content.title}</div>
        <div className="knk-banner__body">{message.content.body}</div>
      </div>
      <div className="knk-banner__actions">
        {message.content.secondary_button && (
          <button className="knk-banner__btn knk-banner__btn--secondary">
            {message.content.secondary_button.text}
          </button>
        )}

        {message.content.primary_button && (
          <button className="knk-banner__btn">
            {message.content.primary_button.text}
          </button>
        )}

        {message.content.dismissible && (
          // TODO: Archive message on click
          <button className="knk-banner__close">
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
        )}
      </div>
    </div>
  );
};
