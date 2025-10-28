import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "../Home";
import { clickSortByHeightCheckbox } from "./helpers";

it("sorts pokemon list by height when checkbox is clicked", async () => {
  render(
    <MemoryRouter initialEntries={["/?type=normal"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for initial list to load (unsorted - API order)
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const [pokemonOne, pokemonTwo, pokemonThree] =
      within(pokemonItemList).getAllByRole("listitem");

    expect(
      within(pokemonOne).getByRole("heading", { level: 3, name: /pidgey/i })
    ).toBeInTheDocument();
    expect(within(pokemonOne).getByText(/height: 3/i)).toBeInTheDocument();

    expect(
      within(pokemonTwo).getByRole("heading", { level: 3, name: /pidgeotto/i })
    ).toBeInTheDocument();
    expect(within(pokemonTwo).getByText(/height: 11/i)).toBeInTheDocument();

    expect(
      within(pokemonThree).getByRole("heading", { level: 3, name: /pidgeot/i })
    ).toBeInTheDocument();
    expect(within(pokemonThree).getByText(/height: 15/i)).toBeInTheDocument();
  });

  await clickSortByHeightCheckbox();

  // Verify list is sorted by height in ascending order
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const [pokemonOne, pokemonTwo, pokemonThree] =
      within(pokemonItemList).getAllByRole("listitem");

    // Pidgey (height 3) should be first
    expect(
      within(pokemonOne).getByRole("heading", { level: 3, name: /pidgey/i })
    ).toBeInTheDocument();
    expect(within(pokemonOne).getByText(/height: 3/i)).toBeInTheDocument();

    // Pidgeotto (height 11) should be second
    expect(
      within(pokemonTwo).getByRole("heading", { level: 3, name: /pidgeotto/i })
    ).toBeInTheDocument();
    expect(within(pokemonTwo).getByText(/height: 11/i)).toBeInTheDocument();

    // Pidgeot (height 15) should be third
    expect(
      within(pokemonThree).getByRole("heading", { level: 3, name: /pidgeot/i })
    ).toBeInTheDocument();
    expect(within(pokemonThree).getByText(/height: 15/i)).toBeInTheDocument();
  });
});

it("unsorts pokemon list when checkbox is unchecked", async () => {
  // Arrange
  render(
    <MemoryRouter initialEntries={["/?type=normal"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for initial list to load
  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(pokemonItemList).toBeInTheDocument();
  });

  await clickSortByHeightCheckbox();

  await waitFor(() => {
    const orderCheckboxes = within(contentArea).getByRole("group", {
      name: /order the pokemons/i,
    });
    const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
      name: /by height/i,
    });
    expect(sortByHeightCheckbox).toBeChecked();
  });

  await clickSortByHeightCheckbox();

  await waitFor(() => {
    const orderCheckboxes = within(contentArea).getByRole("group", {
      name: /order the pokemons/i,
    });
    const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
      name: /by height/i,
    });
    expect(sortByHeightCheckbox).not.toBeChecked();

    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const [pokemonOne, pokemonTwo, pokemonThree] =
      within(pokemonItemList).getAllByRole("listitem");

    expect(
      within(pokemonOne).getByRole("heading", { level: 3, name: /pidgey/i })
    ).toBeInTheDocument();
    expect(within(pokemonOne).getByText(/height: 3/i)).toBeInTheDocument();

    expect(
      within(pokemonTwo).getByRole("heading", { level: 3, name: /pidgeotto/i })
    ).toBeInTheDocument();
    expect(within(pokemonTwo).getByText(/height: 11/i)).toBeInTheDocument();

    expect(
      within(pokemonThree).getByRole("heading", { level: 3, name: /pidgeot/i })
    ).toBeInTheDocument();
    expect(within(pokemonThree).getByText(/height: 15/i)).toBeInTheDocument();
  });
});
