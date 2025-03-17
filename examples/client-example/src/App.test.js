import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import App from "./App.jsx";

describe("App component", () => {
  it("renders learn react link", () => {
    render(<App />);
    const linkElement = screen.getByText(/feed items/i);
    expect(linkElement).toBeInTheDocument();
  });
});
