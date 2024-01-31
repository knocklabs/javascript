import React from "react";
import { render as rtlRender } from "@testing-library/react";
import {
  KnockProvider,
  KnockFeedProvider,
  KnockProviderProps,
  KnockFeedProviderProps,
} from "../src";

const defaultKnockProviderProps: KnockProviderProps = {
  apiKey: "apiKey",
  userId: "userId",
};

const defaultKnockFeedProviderProps: KnockFeedProviderProps = {
  feedId: "feedId",
};

export function renderWithProviders(
  ui,
  {
    knockProviderProps = {},
    knockFeedProviderProps = {},
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }) {
    const actualKnockProviderProps = {
      ...defaultKnockProviderProps,
      ...knockProviderProps,
    };

    const actualKnockFeedProviderProps = {
      ...defaultKnockFeedProviderProps,
      ...knockFeedProviderProps,
    };

    return (
      <KnockProvider {...actualKnockProviderProps}>
        <KnockFeedProvider {...actualKnockFeedProviderProps}>
          {children}
        </KnockFeedProvider>
      </KnockProvider>
    );
  }

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";
