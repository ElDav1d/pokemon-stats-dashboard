import { render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "../Home";

it("shows loading message when fetching pokemon list", async () => {
  // Mock a delayed fetch to simulate loading
  global.fetch = vi.fn(
    () =>
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: async () => ({
                pokemon: [],
              }),
            } as Response),
          1000
        )
      )
  );

  render(
    <MemoryRouter initialEntries={["/?type=normal"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const loadingMessage = screen.getByRole("heading", {
    level: 3,
    name: /loading pokemon list/i,
  });

  expect(loadingMessage).toBeInTheDocument();

  await waitFor(
    () => {
      expect(loadingMessage).not.toBeInTheDocument();
    },
    { timeout: 2000 }
  );
});

it("does not show loading message when no type is selected", async () => {
  // Mock fetch - it shouldn't be called for pokemon list when no type is selected
  // But it will be called for pokemon types list
  global.fetch = vi.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: async () => {
        // Handle the pokemon types list fetch
        if (url.includes("/type/") && !url.match(/\/type\/\w+$/)) {
          return { results: [] };
        }
        // This shouldn't be called when no type is selected
        return { pokemon: [] };
      },
    } as Response)
  );

  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  await waitFor(() => {
    const loadingMessage = screen.queryByRole("heading", {
      level: 3,
      name: /loading pokemon list/i,
    });
    expect(loadingMessage).not.toBeInTheDocument();
  });
});
