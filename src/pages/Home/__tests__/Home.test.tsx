import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Home from "../Home";

it("renders the initial elements", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const header = screen.getByRole("banner");
  const heading = within(header).getByRole("heading", {
    name: /pokemon Dashboard/i,
    level: 1,
  });

  expect(heading).toBeInTheDocument();

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  // Wait for type list to load
  await waitFor(async () => {
    const selectTypeList = await within(contentArea).findByRole("list", {
      name: /select a pokemon type to get the list/i,
    });

    expect(
      await within(selectTypeList).findByRole("button", { name: /normal/i })
    ).toBeInTheDocument();
    expect(
      await within(selectTypeList).findByRole("button", { name: /fire/i })
    ).toBeInTheDocument();
    expect(
      await within(selectTypeList).findByRole("button", { name: /water/i })
    ).toBeInTheDocument();
    expect(
      await within(selectTypeList).findByRole("button", { name: /grass/i })
    ).toBeInTheDocument();
  });

  // Wait for checkbox to appear (after default type is selected)
  await waitFor(() => {
    const orderCheckboxes = within(contentArea).getByRole("group", {
      name: /order the pokemons/i,
    });
    const sortByHeightCheckbox = within(orderCheckboxes).getByRole("checkbox", {
      name: /by height/i,
    });
    expect(sortByHeightCheckbox).toBeInTheDocument();
  });

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
      within(pokemonOne).getByRole("img", { name: /pidgey/i })
    ).toBeInTheDocument();

    expect(
      within(pokemonTwo).getByRole("heading", { level: 3, name: /pidgeotto/i })
    ).toBeInTheDocument();
    expect(within(pokemonTwo).getByText(/height: 11/i)).toBeInTheDocument();
    expect(
      within(pokemonTwo).getByRole("img", { name: /pidgeotto/i })
    ).toBeInTheDocument();

    expect(
      within(pokemonThree).getByRole("heading", { level: 3, name: /pidgeot/i })
    ).toBeInTheDocument();
    expect(within(pokemonThree).getByText(/height: 15/i)).toBeInTheDocument();
    expect(
      within(pokemonThree).getByRole("img", { name: /pidgeot/i })
    ).toBeInTheDocument();
  });
});
