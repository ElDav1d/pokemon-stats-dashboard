import { render, screen, waitFor, within } from "@testing-library/react";
import { expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from "../Home";

it("renders a list of specific pokemons when a type is selected", async () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </MemoryRouter>
  );

  const contentArea = within(screen.getByRole("main")).getByRole("article");

  await waitFor(async () => {
    const selectTypeList = await within(contentArea).findByRole("list", {
      name: /select a pokemon type to get the list/i,
    });

    const buttonFireType = await within(selectTypeList).findByRole("button", {
      name: /fire/i,
    });

    await user.click(buttonFireType);

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
