import { Avatar } from "@knocklabs/react";
import { render } from "@testing-library/react";
import { describe, it } from "vitest";


describe("Avatar", () => {
  it("renders without crashing with initials", () => {
    render(<Avatar name="John Doe" />);
  });

  it("renders without crashing with image src", () => {
    render(<Avatar name="John Doe" src="https://example.com/avatar.png" />);
  });
}); 