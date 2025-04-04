import { render as rtlRender } from "@testing-library/react";
import React from "react";

import {
  KnockFeedProvider,
  KnockFeedProviderProps,
  KnockProvider,
  KnockProviderProps,
} from "../src";

const defaultKnockProviderProps: KnockProviderProps = {
  apiKey: "apiKey",
  userId: "userId",
};

const defaultKnockFeedProviderProps: KnockFeedProviderProps = {
  feedId: "feedId",
};

export function renderWithProviders(
  ui: React.ReactNode,
  {
    knockProviderProps = {},
    knockFeedProviderProps = {},
    ...renderOptions
  } = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
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
