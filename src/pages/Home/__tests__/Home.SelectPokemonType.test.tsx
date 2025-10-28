import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "../Home";
import { clickButtonFireType } from "./helpers";

it("renders a list of specific pokemons when a type is selected", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
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
