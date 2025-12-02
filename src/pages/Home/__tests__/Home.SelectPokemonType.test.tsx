import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it, beforeEach, afterEach, vi } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import Home from "../Home";
import { store } from "../../../infrastructure/redux/store";
import { clickButtonFireType } from "./helpers";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("renders a list of specific pokemons when a type is selected", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  await within(contentArea).findByRole("list", {
    name: /select a pokemon type to get the list/i,
  });

  await clickButtonFireType();

  await waitFor(async () => {
    const pokemonItemList = await within(contentArea).findByRole("list", {
      name: /pokemon list/i,
    });

    const [pokemonOne, ,] = within(pokemonItemList).getAllByRole("listitem");

    expect(
      within(pokemonOne).getByRole("heading", {
        level: 3,
        name: /charmander/i,
      })
    ).toBeInTheDocument();
    expect(within(pokemonOne).getByText(/height: 6/i)).toBeInTheDocument();
    expect(
      within(pokemonOne).getByRole("img", { name: /charmander/i })
    ).toBeInTheDocument();
  });
});

it("shows loading message when fetching pokemon types", async () => {
  global.fetch = vi.fn((url: string) => {
    // Only delay the pokemon types endpoint
    if (url.includes("/type") && !url.match(/\/type\/\w+$/)) {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              ok: true,
              json: async () => ({ results: [] }),
            } as Response),
          100
        )
      );
    }
    // Other endpoints respond immediately
    return Promise.resolve({
      ok: true,
      json: async () => ({ pokemon: [], results: [] }),
    } as Response);
  });

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
    expect(
      screen.getByRole("heading", {
        name: /loading pokemon types/i,
      })
    ).toBeInTheDocument();
  });

  await waitFor(
    () => {
      expect(
        screen.queryByRole("heading", {
          name: /loading pokemon types/i,
        })
      ).not.toBeInTheDocument();
    },
    { timeout: 200 }
  );
});

it("shows error message when fetch fails", async () => {
  global.fetch = vi.fn((url: string) => {
    // Only fail the pokemon types endpoint
    if (url.includes("/type") && !url.match(/\/type\/\w+$/)) {
      return Promise.resolve({
        ok: false,
        status: 500,
      } as Response);
    }
    // Other endpoints respond successfully
    return Promise.resolve({
      ok: true,
      json: async () => ({ pokemon: [], results: [] }),
    } as Response);
  });

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
    expect(
      screen.getByRole("heading", {
        name: /error loading pokemon types/i,
      })
    ).toBeInTheDocument();
  });
});
