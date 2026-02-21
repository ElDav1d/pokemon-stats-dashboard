import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import Home from "../Home";
import { store } from "../../../shared/infrastructure/redux/store";
import { typeInNameFilter } from "./helpers";

it("renders only matching pokemons when user types complete name in name filter", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /charmander/i }),
    ).toBeInTheDocument();
  });

  await typeInNameFilter("charmeleon");

  // Only charmeleon should remain visible
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /charmeleon/i }),
    ).toBeInTheDocument();
  });
});

it("renders only matching pokemon when user types partial name in name filter", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // "mander" is a suffix of "charmander" only — not present in "charmeleon" or "charizard"
  await typeInNameFilter("mander");

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /charmander/i }),
    ).toBeInTheDocument();
  });
});

it("renders only matching pokemon when user types uppercase name in name filter", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  await typeInNameFilter("CHARMELEON");

  // Only charmeleon should remain visible despite uppercase input
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /charmeleon/i }),
    ).toBeInTheDocument();
  });
});

it("renders charmander when filtering by prefix of its name", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // "char" is a shared prefix — charmander must be in results alongside others
  await typeInNameFilter("char");

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(
      within(pokemonItemList).getByRole("heading", {
        level: 3,
        name: /charmander/i,
      }),
    ).toBeInTheDocument();
  });
});

it("renders only charmander when filtering by middle substring of its name", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // "man" appears in "char-MAN-der" only
  await typeInNameFilter("man");

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /charmander/i }),
    ).toBeInTheDocument();
  });
});

it("renders only charmander when filtering by suffix of its name", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // "der" is the suffix of "charman-DER" only
  await typeInNameFilter("der");

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    const items = within(pokemonItemList).getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(
      within(items[0]).getByRole("heading", { level: 3, name: /charmander/i }),
    ).toBeInTheDocument();
  });
});

it("renders empty state message when filter matches no pokemons", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for all fire type pokemon to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  // "pikachu" is not a fire type pokemon — no results expected
  await typeInNameFilter("pikachu");

  await waitFor(() => {
    expect(
      screen.getByRole("heading", { level: 2, name: /sorry.*cannot find/i }),
    ).toBeInTheDocument();
  });
});

it("renders all pokemons again when user clears the name filter", async () => {
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for initial full list
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(3);
  });

  await typeInNameFilter("charmeleon");

  // Filter applied — only one item
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(within(pokemonItemList).getAllByRole("listitem")).toHaveLength(1);
  });

  // Clear the filter
  await typeInNameFilter("");

  // All pokemons visible again in original order
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const [itemOne, itemTwo, itemThree] =
      within(pokemonItemList).getAllByRole("listitem");

    expect(
      within(itemOne).getByRole("heading", { level: 3, name: /charmander/i }),
    ).toBeInTheDocument();
    expect(
      within(itemTwo).getByRole("heading", { level: 3, name: /charmeleon/i }),
    ).toBeInTheDocument();
    expect(
      within(itemThree).getByRole("heading", { level: 3, name: /charizard/i }),
    ).toBeInTheDocument();
  });
});
