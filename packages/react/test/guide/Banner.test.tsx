import { render } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { Banner } from "../../src/modules/guide/components/Banner/Banner";

vi.mock("@knocklabs/react-core", async () => {
  const actual = await vi.importActual("@knocklabs/react-core");
  return {
    ...actual,
    useGuide: () => ({
      colorMode: "light",
      guide: { id: "g1" },
      step: {
        content: {
          title: "Welcome",
          body: "Hello world",
          dismissible: true,
        },
        markAsSeen: vi.fn(),
        markAsArchived: vi.fn(),
      },
    }),
  };
});

describe("Banner", () => {
  test("renders title and body when guide present", () => {
    const { getByText } = render(<Banner />);
    expect(getByText("Welcome")).toBeInTheDocument();
    expect(getByText(/hello world/i)).toBeInTheDocument();
  });
});
