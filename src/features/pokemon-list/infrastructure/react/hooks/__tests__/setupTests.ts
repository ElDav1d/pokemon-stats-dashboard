import { vi, beforeEach } from "vitest";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonReference } from "../../../../../../shared/domain/value-objects";
import { PokemonItem } from "../../../../domain/value-objects/PokemonItem";

// Global test data and mocks
export const testData = {
  mockRepository: null as PokemonRepository | null,
  mockPokemonReferences: [] as PokemonReference[],
  mockPokemonsByName: [] as PokemonItem[],
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
    new PokemonItem(
      "bulbasaur",
      20,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    ),
    new PokemonItem(
      "ivysaur",
      10,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    ),
    new PokemonItem(
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
