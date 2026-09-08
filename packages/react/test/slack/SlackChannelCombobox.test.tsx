import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { SlackChannelCombobox } from "../../src/modules/slack/components/SlackChannelCombobox/SlackChannelCombobox";

const slackChannels = [
  { id: "C0123ABC", name: "general", is_private: false },
  { id: "C0456DEF", name: "engineering", is_private: true },
];

let connectedChannels: Array<{ channel_id?: string }> | undefined = [];
let connectionStatus = "connected";
const updateConnectedChannels = vi.fn().mockResolvedValue(undefined);

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useTranslations: () => ({ t: (k: string) => k }),
    useKnockSlackClient: () => ({ connectionStatus, errorLabel: null }),
    useSlackChannels: () => ({ data: slackChannels, isLoading: false }),
    useConnectedSlackChannels: () => ({
      data: connectedChannels,
      updateConnectedChannels,
      error: null,
      updating: false,
    }),
  };
});

const recipientObject = { objectId: "object_123", collection: "projects" };

const renderCombobox = () =>
  render(<SlackChannelCombobox slackChannelsRecipientObject={recipientObject} />);

describe("SlackChannelCombobox", () => {
  beforeEach(() => {
    connectedChannels = [];
    connectionStatus = "connected";
    updateConnectedChannels.mockClear();
  });

  test("trigger announces connected channels by name, not by id", () => {
    connectedChannels = [{ channel_id: "C0123ABC" }];

    renderCombobox();

    // Options render an icon beside the channel name, so their children are
    // elements and the combobox falls back to naming the trigger after the raw
    // channel id. The component passes its own `aria-label` instead.
    expect(screen.getByRole("combobox")).toHaveAccessibleName("general");
  });

  test("trigger announces every connected channel by name", () => {
    connectedChannels = [{ channel_id: "C0123ABC" }, { channel_id: "C0456DEF" }];

    renderCombobox();

    expect(screen.getByRole("combobox")).toHaveAccessibleName(
      "general, engineering",
    );
  });

  test("shows the placeholder when no channels are connected", () => {
    connectedChannels = [];

    renderCombobox();

    expect(
      screen.getByText("slackSearchbarNoChannelsConnected"),
    ).toBeInTheDocument();
  });

  test("ignores connections for channels that are no longer available", () => {
    connectedChannels = [{ channel_id: "C0123ABC" }, { channel_id: "C0NOPE" }];

    renderCombobox();

    // The accessible name alone cannot catch this: an id with no matching
    // option contributes nothing to the name. It does render a tag though, so
    // assert on that.
    expect(screen.getByRole("combobox")).toHaveAccessibleName("general");
    expect(screen.queryByText("C0NOPE")).not.toBeInTheDocument();
  });

  test("each option still shows its channel-type icon", async () => {
    connectedChannels = [];

    renderCombobox();

    fireEvent.click(screen.getByRole("combobox"));

    const option = await screen.findByRole("option", { name: "general" });

    // Two icons per option: the selection check, and the hash/lock that says
    // whether the channel is private. The second one is the reason the option
    // keeps element children instead of a bare string label.
    expect(option.querySelectorAll("[data-tgph-icon-svg]")).toHaveLength(2);
  });

  test("selecting an option connects that channel", async () => {
    connectedChannels = [];

    renderCombobox();

    fireEvent.click(screen.getByRole("combobox"));

    const option = await screen.findByRole("option", { name: "general" });
    fireEvent.click(option);

    await waitFor(() =>
      expect(updateConnectedChannels).toHaveBeenCalledWith([
        { channel_id: "C0123ABC" },
      ]),
    );
  });

  test("renders before the connected channels have loaded", () => {
    connectedChannels = undefined;

    renderCombobox();

    expect(screen.getByRole("combobox")).toHaveAccessibleName(
      "slackSearchbarNoChannelsConnected",
    );
  });

  test("ignores a connection that carries no channel id", () => {
    connectedChannels = [{ channel_id: "C0123ABC" }, {}];

    renderCombobox();

    expect(screen.getByRole("combobox")).toHaveAccessibleName("general");
  });

  test("stays disabled when the connection errored with no label to show", () => {
    // Nothing is connected and `errorLabel` is null, so both the names and the
    // placeholder the trigger falls back to are empty. It still has to be
    // handed a string, since undefined would blank the label the trigger
    // derives for itself.
    connectionStatus = "error";
    connectedChannels = [];

    renderCombobox();

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-label", "");
  });
});
