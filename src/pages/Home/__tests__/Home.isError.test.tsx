import { render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi, beforeEach, afterEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "../Home";

beforeEach(() => {
  // Suppress console.error for these tests since we're testing error states
  vi.spyOn(console, "error").mockImplementation(() => {});

  // Mock fetch to return an error
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: false,
      status: 500,
      json: async () => ({}),
    } as Response)
  );
});

afterEach(() => {
  // Restore console.error and other mocks after each test
  vi.restoreAllMocks();
});

it("shows error message when fetch fails", async () => {
  render(
    <MemoryRouter initialEntries={["/?type=normal"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(
    () => {
      const errormessage = screen.getByRole("heading", {
        level: 3,
        name: /error loading pokemon list/i,
      });
      expect(errormessage).toBeInTheDocument();
    },
    { timeout: 2000 }
  );
});

it("does not show error message when no type is selected", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    const errormessage = screen.queryByRole("heading", {
      level: 3,
      name: /error loading pokemon list/i,
    });

    expect(errormessage).not.toBeInTheDocument();
  });
});
