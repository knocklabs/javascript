import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { MsTeamsChannelInTeamCombobox } from "../../src/modules/ms-teams/components/MsTeamsChannelCombobox/MsTeamsChannelInTeamCombobox";
import { MsTeamsTeamCombobox } from "../../src/modules/ms-teams/components/MsTeamsChannelCombobox/MsTeamsTeamCombobox";

const teams = [
  { id: "team_1", displayName: "Engineering" },
  { id: "team_2", displayName: "Design" },
];

const channels = [
  { id: "channel_1", displayName: "General" },
  { id: "channel_2", displayName: "Releases" },
];

let connectedChannels: Array<{
  ms_teams_team_id?: string;
  ms_teams_channel_id?: string;
}> = [];

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useKnockMsTeamsClient: () => ({ connectionStatus: "connected" }),
    useMsTeamsTeams: () => ({ data: teams, isLoading: false }),
    useMsTeamsChannels: () => ({ data: channels, isLoading: false }),
    useConnectedMsTeamsChannels: () => ({
      data: connectedChannels,
      updateConnectedChannels: vi.fn().mockResolvedValue(undefined),
      error: null,
    }),
  };
});

const recipientObject = { objectId: "object_123", collection: "projects" };

beforeEach(() => {
  connectedChannels = [];
});

describe("MsTeamsTeamCombobox", () => {
  // These options pass string children, so @telegraph/combobox resolves the
  // trigger's accessible name from them without an explicit `label` prop.
  test("trigger announces the selected team by display name", () => {
    render(
      <MsTeamsTeamCombobox
        team={teams[0]!}
        onTeamChange={vi.fn()}
        getChannelCount={() => 0}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAccessibleName("Engineering");
  });

  test("trigger includes the connected channel count", () => {
    render(
      <MsTeamsTeamCombobox
        team={teams[0]!}
        onTeamChange={vi.fn()}
        getChannelCount={() => 2}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAccessibleName(
      "Engineering (2)",
    );
  });

  test("shows the placeholder when no team is selected", () => {
    render(
      <MsTeamsTeamCombobox
        team={null}
        onTeamChange={vi.fn()}
        getChannelCount={() => 0}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAccessibleName("Select team");
  });
});

describe("MsTeamsChannelInTeamCombobox", () => {
  test("trigger announces connected channels by display name", () => {
    connectedChannels = [
      { ms_teams_team_id: "team_1", ms_teams_channel_id: "channel_1" },
    ];

    render(
      <MsTeamsChannelInTeamCombobox
        teamId="team_1"
        msTeamsChannelsRecipientObject={recipientObject}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAccessibleName("General");
  });

  test("ignores connections that belong to another team", () => {
    connectedChannels = [
      { ms_teams_team_id: "team_1", ms_teams_channel_id: "channel_1" },
      { ms_teams_team_id: "team_2", ms_teams_channel_id: "channel_from_team_2" },
    ];

    render(
      <MsTeamsChannelInTeamCombobox
        teamId="team_1"
        msTeamsChannelsRecipientObject={recipientObject}
      />,
    );

    // The accessible name alone cannot catch this: an id with no matching
    // option resolves to undefined and drops out of the name. It does render a
    // tag though, so assert on that.
    expect(screen.getByRole("combobox")).toHaveAccessibleName("General");
    expect(screen.queryByText("channel_from_team_2")).not.toBeInTheDocument();
  });

  test("shows the placeholder when no channels are connected", () => {
    render(
      <MsTeamsChannelInTeamCombobox
        teamId="team_1"
        msTeamsChannelsRecipientObject={recipientObject}
      />,
    );

    expect(screen.getByRole("combobox")).toHaveAccessibleName(
      "Select channels",
    );
  });
});
