import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Home from "../Home";

it("renders the in initial elements", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  const header = screen.getByRole("banner");
  const heading = within(header).getByRole("heading", {
    name: /pokemon Dashboard/i,
    level: 1,
  });

  expect(heading).toBeInTheDocument();
});
