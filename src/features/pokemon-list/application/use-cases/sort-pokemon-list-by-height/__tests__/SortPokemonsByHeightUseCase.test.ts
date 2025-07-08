import { it, expect } from "vitest";
import { pokemonMock1, pokemonMock2, pokemonMock3 } from "./mocks";
import { SortPokemonsByHeightUseCase } from "../SortPokemonLIstByHeightUseCase";
import { PokemonListItem } from "../../../../domain/entities/PokemonListItem";

it("sorts pokemons by height in ascending order", () => {
  const pokemons = [
    new PokemonListItem(
      pokemonMock2.id,
      pokemonMock2.name,
      pokemonMock2.url,
      pokemonMock2.height,
      pokemonMock2.imageUrl
    ),
    new PokemonListItem(
      pokemonMock1.id,
      pokemonMock1.name,
      pokemonMock1.url,
      pokemonMock1.height,
      pokemonMock1.imageUrl
    ),
    new PokemonListItem(
      pokemonMock3.id,
      pokemonMock3.name,
      pokemonMock3.url,
      pokemonMock3.height,
      pokemonMock3.imageUrl
    ),
  ];

  const [sortedPokemon1, sortedPokemon2, sortedPokemon3] =
    SortPokemonsByHeightUseCase.execute(pokemons);
  expect(sortedPokemon1.height).toBe(7);
  expect(sortedPokemon2.height).toBe(12);
  expect(sortedPokemon3.height).toBe(20);
});
