import { vi, beforeEach } from "vitest";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonByType } from "../../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";

// Global test data and mocks
export const testData = {
  mockRepository: null as PokemonRepository | null,
  mockPokemonsByType: [] as PokemonByType[],
  mockPokemonsByName: [] as PokemonByName[],
};

export const createDelayedPromise = (data: any, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

beforeEach(() => {
  testData.mockPokemonsByType = [
    new PokemonByType("bulbasaur", "https://pokeapi.co/api/v2/pokemon/1/"),
    new PokemonByType("ivysaur", "https://pokeapi.co/api/v2/pokemon/2/"),
    new PokemonByType("venusaur", "https://pokeapi.co/api/v2/pokemon/3/"),
  ];

  testData.mockPokemonsByName = [
    new PokemonByName(
      "bulbasaur",
      70,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    ),
    new PokemonByName(
      "ivysaur",
      100,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    ),
    new PokemonByName(
      "venusaur",
      200,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
    ),
  ];

  testData.mockRepository = {
    findAllByType: vi.fn().mockResolvedValue(testData.mockPokemonsByType),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(testData.mockPokemonsByName[0])
      .mockResolvedValueOnce(testData.mockPokemonsByName[1])
      .mockResolvedValueOnce(testData.mockPokemonsByName[2]),
  };
});
