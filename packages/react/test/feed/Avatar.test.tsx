import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, test } from "vitest";

import { Avatar } from "../../src";

function getAvatar(container: HTMLElement) {
  return container.querySelector(".rnf-avatar");
}

describe("Avatar", () => {
  test("renders initials when no src provided", () => {
    const { container } = render(<Avatar name="Jane Doe" />);
    const avatar = getAvatar(container);
    expect(avatar).toBeInTheDocument();
    const initials = container.querySelector(".rnf-avatar__initials");
    expect(initials?.textContent).toBe("JD");
  });

  test("renders image when src provided", () => {
    const { container, getByAltText } = render(
      <Avatar name="John Smith" src="https://example.com/avatar.png" />,
    );
    const img = getByAltText("John Smith") as HTMLImageElement;
    expect(img.src).toContain("https://example.com/avatar.png");
    expect(container.querySelector(".rnf-avatar__initials")).toBeNull();
  });
});
