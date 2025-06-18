import React from "react";
import {
  KnockProvider,
  KnockSlackProvider,
  SlackAuthButton,
  SlackAuthContainer,
  SlackChannelCombobox,
} from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockSlackProvider knockSlackChannelId="channel" tenantId="tenant">
      {children}
    </KnockSlackProvider>
  </KnockProvider>
);

describe("Slack components render", () => {
  it("SlackAuthButton renders", () => {
    render(
      <Wrapper>
        <SlackAuthButton slackClientId="client" />
      </Wrapper>,
    );
  });

  it("SlackAuthContainer renders", () => {
    render(
      <Wrapper>
        <SlackAuthContainer actionButton={<button>action</button>} />
      </Wrapper>,
    );
  });

  it("SlackChannelCombobox renders", () => {
    render(
      <Wrapper>
        <SlackChannelCombobox slackChannelsRecipientObject={{ objectId: "1", collection: "users" }} />
      </Wrapper>,
    );
  });
}); 