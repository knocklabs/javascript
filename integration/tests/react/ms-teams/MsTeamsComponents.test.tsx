import {
  KnockMsTeamsProvider,
  KnockProvider,
  MsTeamsAuthButton,
  MsTeamsAuthContainer,
  MsTeamsChannelCombobox,
} from "@knocklabs/react";
import { render } from "@testing-library/react";
import React from "react";
import { describe, it } from "vitest";

const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockMsTeamsProvider knockMsTeamsChannelId="channel" tenantId="tenant">
      {children}
    </KnockMsTeamsProvider>
  </KnockProvider>
);

describe("MsTeams components render", () => {
  it("MsTeamsAuthButton renders with graphApiClientId prop", () => {
    render(
      <Wrapper>
        <MsTeamsAuthButton graphApiClientId="clientId" />
      </Wrapper>,
    );
  });

  it("MsTeamsAuthButton renders with deprecated msTeamsBotId prop", () => {
    render(
      <Wrapper>
        <MsTeamsAuthButton msTeamsBotId="bot" />
      </Wrapper>,
    );
  });

  it("MsTeamsAuthContainer renders", () => {
    render(
      <Wrapper>
        <MsTeamsAuthContainer actionButton={<button>action</button>} />
      </Wrapper>,
    );
  });

  it("MsTeamsChannelCombobox renders", () => {
    render(
      <Wrapper>
        <MsTeamsChannelCombobox
          msTeamsChannelsRecipientObject={{
            objectId: "1",
            collection: "users",
          }}
        />
      </Wrapper>,
    );
  });
});
