import { render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Home from "../Home";
import { store } from "../../../shared/infrastructure/redux/store";

it("shows loading message when fetching pokemon list", async () => {
  // Mock a delayed fetch to simulate loading
  global.fetch = vi.fn((url: string) => {
    // Only delay pokemon list endpoints (type/{type} and pokemon/{name})
    if (url.includes("/type/") || url.includes("/pokemon/")) {
      return new Promise((resolve) =>
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
      );
    }
    // SelectPokemonType's /type endpoint responds immediately
    return Promise.resolve({
      ok: true,
      json: async () => ({
        results: [],
      }),
    } as Response);
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=normal"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>
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
        if (url.endsWith("/type")) {
          return { results: [] };
        }
        // This shouldn't be called when no type is selected
        return { pokemon: [] };
      },
    } as Response)
  );

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  await waitFor(() => {
    const loadingMessage = screen.queryByRole("heading", {
      level: 3,
      name: /loading pokemon list/i,
    });
    expect(loadingMessage).not.toBeInTheDocument();
  });
});
