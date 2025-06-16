import React from "react";
import {
  KnockProvider,
  KnockFeedProvider,
  KnockSlackProvider,
  KnockMsTeamsProvider,
  KnockGuideProvider,
  KnockI18nProvider,
  useKnockClient,
  useStableOptions,
  useKnockFeed,
  useKnockSlackClient,
  useKnockMsTeamsClient,
  useGuide,
  useTranslations,
} from "@knocklabs/react-core";
import { renderHook } from "@testing-library/react";
import { describe, it  } from "vitest";


// -----------------------------------------------------------------------------
// Helper wrappers for renderHook
// -----------------------------------------------------------------------------
const withKnock = ({ children }: { children: React.ReactNode }) => (
  <KnockProvider apiKey="test" userId="user">
    {children}
  </KnockProvider>
);

const withFeed = ({ children }: { children: React.ReactNode }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockFeedProvider feedId="feed">{children}</KnockFeedProvider>
  </KnockProvider>
);

const withSlack = ({ children }: { children: React.ReactNode }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockSlackProvider knockSlackChannelId="channel" tenantId="tenant">
      {children}
    </KnockSlackProvider>
  </KnockProvider>
);

const withMsTeams = ({ children }: { children: React.ReactNode }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockMsTeamsProvider knockMsTeamsChannelId="channel" tenantId="tenant">
      {children}
    </KnockMsTeamsProvider>
  </KnockProvider>
);

const withGuide = ({ children }: { children: React.ReactNode }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockGuideProvider channelId="channel" readyToTarget={false}>
      {children}
    </KnockGuideProvider>
  </KnockProvider>
);

const withI18n = ({ children }: { children: React.ReactNode }) => (
  <KnockI18nProvider>{children}</KnockI18nProvider>
);

// -----------------------------------------------------------------------------
// Smoke tests for hooks (import + basic invocation)
// -----------------------------------------------------------------------------

describe("react-core hooks", () => {
  it("useKnockClient", () => {
    renderHook(() => useKnockClient(), { wrapper: withKnock });
  });

  it("useStableOptions", () => {
    const options = { a: 1 };
    const { result, rerender } = renderHook((opts) => useStableOptions(opts), {
      initialProps: options,
    });
    rerender(options); // ensure stable
    void result;
  });

  it("useKnockFeed", () => {
    renderHook(() => useKnockFeed(), { wrapper: withFeed });
  });

  it("useKnockSlackClient", () => {
    renderHook(() => useKnockSlackClient(), { wrapper: withSlack });
  });

  it("useKnockMsTeamsClient", () => {
    renderHook(() => useKnockMsTeamsClient(), { wrapper: withMsTeams });
  });

  it("useGuide", () => {
    renderHook(() => useGuide({ key: "guide" }), { wrapper: withGuide });
  });

  it("useTranslations", () => {
    renderHook(() => useTranslations(), { wrapper: withI18n });
  });
}); 