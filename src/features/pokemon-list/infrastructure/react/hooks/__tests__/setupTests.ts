import { vi, beforeEach } from "vitest";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonByType } from "../../../../../../shared/domain/value-objects";
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
    new PokemonByType("bulbasaur"),
    new PokemonByType("ivysaur"),
    new PokemonByType("venusaur"),
  ];

  testData.mockPokemonsByName = [
    new PokemonByName(
      "bulbasaur",
      20,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    ),
    new PokemonByName(
      "ivysaur",
      10,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    ),
    new PokemonByName(
      "venusaur",
      7,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
    ),
  ];

  testData.mockRepository = {
    findAllByType: vi.fn().mockResolvedValue(testData.mockPokemonsByType),
    findDetailsByName: vi.fn().mockImplementation((name: string) => {
      const detail = testData.mockPokemonsByName.find((p) => p.name === name);
      return Promise.resolve(detail);
    }),
  };
});
