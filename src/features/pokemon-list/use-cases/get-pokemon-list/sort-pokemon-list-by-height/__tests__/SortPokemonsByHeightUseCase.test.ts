import { it, expect } from "vitest";
import { pokemonMock1, pokemonMock2, pokemonMock3 } from "./mocks";
import { Pokemon } from "../../../../domain/entities/Pokemon";
import { SortPokemonsByHeightUseCase } from "../SortPokemonLIstByHeightUseCase";

it("sorts pokemons by height in ascending order", () => {
  const pokemons = [
    new Pokemon(
      pokemonMock2.name,
      pokemonMock2.url,
      pokemonMock2.height,
      pokemonMock2.imageUrl
    ),
    new Pokemon(
      pokemonMock1.name,
      pokemonMock1.url,
      pokemonMock1.height,
      pokemonMock1.imageUrl
    ),
    new Pokemon(
      pokemonMock3.name,
      pokemonMock3.url,
      pokemonMock3.height,
      pokemonMock3.imageUrl
    ),
  ];

  const sortedPokemons = SortPokemonsByHeightUseCase.execute(pokemons);

  expect(sortedPokemons).toStrictEqual([
    new Pokemon(
      pokemonMock1.name,
      pokemonMock1.url,
      pokemonMock1.height,
      pokemonMock1.imageUrl
    ),
    new Pokemon(
      pokemonMock3.name,
      pokemonMock3.url,
      pokemonMock3.height,
      pokemonMock3.imageUrl
    ),
    new Pokemon(
      pokemonMock2.name,
      pokemonMock2.url,
      pokemonMock2.height,
      pokemonMock2.imageUrl
    ),
  ]);
});
