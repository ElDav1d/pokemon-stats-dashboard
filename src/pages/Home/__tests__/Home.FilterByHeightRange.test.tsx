import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Home from "../Home";
import { store } from "../../../shared/infrastructure/redux/store";
import { typeInMinHeightFilter, typeInMaxHeightFilter } from "./helpers";

// Normal type pokemon: pidgey h:3, pidgeotto h:11, pidgeot h:15

it("filters pokemon list when user types a minimum height", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=normal"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all normal type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // min=10 → pidgeotto (h:11) and pidgeot (h:15) should remain
  await typeInMinHeightFilter(10);

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /pidgeotto/i }),
    ).toBeInTheDocument();
    expect(
      within(items[1]).getByRole("heading", { level: 3, name: /pidgeot/i }),
    ).toBeInTheDocument();
  });
});

it("filters pokemon list when user types both min and max height", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=normal"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all normal type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // min=10, max=12 → only pidgeotto (h:11) fits
  await typeInMinHeightFilter(10);
  await typeInMaxHeightFilter(12);

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /pidgeotto/i }),
    ).toBeInTheDocument();
  });
});

it("renders empty state when no pokemon matches the minimum height", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=normal"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all normal type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // min=20 → no pokemon is that tall (tallest is pidgeot h:15)
  await typeInMinHeightFilter(20);

  await waitFor(() => {
    const statusEl = within(contentArea).getByRole("status");
    expect(statusEl).toHaveTextContent(/sorry.*cannot find/i);
  });
});

it("shows validation alert when min height is greater than max height", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=normal"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all normal type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // min=15, max=5 → invalid range
  await typeInMinHeightFilter(15);
  await typeInMaxHeightFilter(5);

  await waitFor(() => {
    const alertEl = within(contentArea).getByRole("alert");
    expect(alertEl).toHaveTextContent(/min height cannot be greater than max height/i);
  });
});
