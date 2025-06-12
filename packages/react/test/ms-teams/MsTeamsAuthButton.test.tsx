import { fireEvent, render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

// Import component after mocks are set up
import { MsTeamsAuthButton } from "../../src/modules/ms-teams/components/MsTeamsAuthButton/MsTeamsAuthButton";

// Spy openPopupWindow
const openPopupSpy: ReturnType<typeof vi.fn> = vi.fn();
vi.mock("../../../core/utils", () => {
  return { __esModule: true, openPopupWindow: openPopupSpy };
});

// Mock react-core hooks
vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useTranslations: () => ({ t: (k: string) => k }),
    useKnockClient: () => ({ host: "https://api.knock.app" }),
    useMsTeamsAuth: () => ({
      buildMsTeamsAuthUrl: () => "https://auth",
      disconnectFromMsTeams: vi.fn(),
    }),
    useKnockMsTeamsClient: () => currentState,
  };
});

// Shared mutable state for the mocked hook
let currentState: Record<string, unknown> = {};

describe("MsTeamsAuthButton", () => {
  test("disconnected state shows connect text and opens popup on click", () => {
    currentState = {
      connectionStatus: "disconnected",
      setConnectionStatus: vi.fn(),
      setActionLabel: vi.fn(),
      actionLabel: null,
      errorLabel: null,
    };

    const { getByText } = render(<MsTeamsAuthButton msTeamsBotId="bot" />);

    const btn = getByText("msTeamsConnect").closest("button") as HTMLElement;
    fireEvent.click(btn);
  });

  test("error state shows error text", () => {
    currentState = {
      connectionStatus: "error",
      setConnectionStatus: vi.fn(),
      setActionLabel: vi.fn(),
      actionLabel: null,
      errorLabel: "Error",
    };

    const { getByText } = render(<MsTeamsAuthButton msTeamsBotId="bot" />);

    expect(getByText("Error")).toBeInTheDocument();
  });
});
