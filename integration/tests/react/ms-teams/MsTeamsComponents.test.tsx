import React from "react";
import {
  KnockProvider,
  KnockMsTeamsProvider,
  MsTeamsAuthButton,
  MsTeamsAuthContainer,
  MsTeamsChannelCombobox,
} from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it  } from "vitest";


const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <KnockProvider apiKey="test" userId="user">
    <KnockMsTeamsProvider knockMsTeamsChannelId="channel" tenantId="tenant">
      {children}
    </KnockMsTeamsProvider>
  </KnockProvider>
);

describe("MsTeams components render", () => {
  it("MsTeamsAuthButton renders", () => {
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
        <MsTeamsChannelCombobox msTeamsChannelsRecipientObject={{ objectId: "1", collection: "users" }} />
      </Wrapper>,
    );
  });
}); 