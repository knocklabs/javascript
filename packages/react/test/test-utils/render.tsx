import { render as rtlRender } from "@testing-library/react";
import React from "react";

import {
  KnockFeedProvider,
  KnockFeedProviderProps,
  KnockProvider,
  KnockProviderProps,
} from "../../src";

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
  }: {
    knockProviderProps?: Partial<KnockProviderProps>;
    knockFeedProviderProps?: Partial<KnockFeedProviderProps>;
  } = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const actualKnockProviderProps = {
      ...defaultKnockProviderProps,
      ...knockProviderProps,
    } as KnockProviderProps;

    const actualKnockFeedProviderProps = {
      ...defaultKnockFeedProviderProps,
      ...knockFeedProviderProps,
    } as KnockFeedProviderProps;

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
