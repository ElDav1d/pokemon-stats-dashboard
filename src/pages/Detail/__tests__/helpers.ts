import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export const clickTypeButton = async (typeName: string) => {
  const user = userEvent.setup();

  const typeButton = await screen.findByRole("button", {
    name: new RegExp(typeName, "i"),
  });

  await user.click(typeButton);
};

export const clickEvolutionLink = async (pokemonName: string) => {
  const user = userEvent.setup();

  const evolutionLink = await screen.findByRole("link", {
    name: new RegExp(pokemonName, "i"),
  });

  await user.click(evolutionLink);
};
