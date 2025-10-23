import { it, expect } from "vitest";
import { SortPokemonsByHeightUseCase } from "../SortPokemonLIstByHeightUseCase";
import {
  mockPokemonListItemBulbasaur,
  mockPokemonListItemIvysaur,
  mockPokemonListItemVenusaur,
} from "../../../../__tests__/mocks";

it("sorts pokemons by height in ascending order", () => {
  const pokemons = [
    mockPokemonListItemIvysaur,
    mockPokemonListItemBulbasaur,
    mockPokemonListItemVenusaur,
  ];

  const [sortedPokemon1, sortedPokemon2, sortedPokemon3] =
    SortPokemonsByHeightUseCase.execute(pokemons);
  expect(sortedPokemon1.height).toBe(7);
  expect(sortedPokemon2.height).toBe(12);
  expect(sortedPokemon3.height).toBe(20);
});
