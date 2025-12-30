import { vi, beforeEach } from "vitest";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonReference } from "../../../../../../shared/domain/value-objects";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";

// Global test data and mocks
export const testData = {
  mockRepository: null as PokemonRepository | null,
  mockPokemonReferences: [] as PokemonReference[],
  mockPokemonsByName: [] as PokemonByName[],
};

export const createDelayedPromise = (data: any, delay = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
};

beforeEach(() => {
  testData.mockPokemonReferences = [
    new PokemonReference("bulbasaur"),
    new PokemonReference("ivysaur"),
    new PokemonReference("venusaur"),
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
    findAllByType: vi.fn().mockResolvedValue(testData.mockPokemonReferences),
    findDetailsByName: vi.fn().mockImplementation((name: string) => {
      const detail = testData.mockPokemonsByName.find((p) => p.name === name);
      return Promise.resolve(detail);
    }),
  };
});
