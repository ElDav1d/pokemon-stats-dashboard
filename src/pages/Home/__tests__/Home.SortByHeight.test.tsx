import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import Home from "../Home";

it("sorts pokemon list by height when checkbox is clicked", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={["/?type=normal"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const [pokemonOne, pokemonTwo, pokemonThree] =
      within(pokemonItemList).getAllByRole("listitem");

    expect(
      within(pokemonOne).getByRole("heading", { level: 3, name: /pidgey/i })
    ).toBeInTheDocument();
    expect(
      within(pokemonTwo).getByRole("heading", { level: 3, name: /pidgeotto/i })
    ).toBeInTheDocument();
    expect(
      within(pokemonThree).getByRole("heading", { level: 3, name: /pidgeot/i })
    ).toBeInTheDocument();
  });

  const orderCheckboxes = within(contentArea).getByRole("group", {
    name: /order the pokemons/i,
  });
  const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
    name: /by height/i,
  });

  await user.click(sortByHeightCheckbox);

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
});

it("unsorts pokemon list when checkbox is unchecked", async () => {
  const user = userEvent.setup();

  render(
    <MemoryRouter initialEntries={["/?type=normal"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  await waitFor(() => {
    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });
    expect(pokemonItemList).toBeInTheDocument();
  });

  const orderCheckboxes = within(contentArea).getByRole("group", {
    name: /order the pokemons/i,
  });
  const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
    name: /by height/i,
  });

  await user.click(sortByHeightCheckbox);

  await waitFor(() => {
    expect(sortByHeightCheckbox).toBeChecked();
  });

  await user.click(sortByHeightCheckbox);

  await waitFor(() => {
    expect(sortByHeightCheckbox).not.toBeChecked();

    const pokemonItemList = within(contentArea).getByRole("list", {
      name: /pokemon list/i,
    });

    const [pokemonOne] = within(pokemonItemList).getAllByRole("listitem");

    expect(
      within(pokemonOne).getByRole("heading", { level: 3, name: /pidgey/i })
    ).toBeInTheDocument();
  });
});
