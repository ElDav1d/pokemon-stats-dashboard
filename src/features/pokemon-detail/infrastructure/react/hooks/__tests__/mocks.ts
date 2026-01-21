import { vi } from "vitest";
import { PokemonReference } from "../../../../../../shared/domain/value-objects/PokemonReference";
import { PokemonDetailRepository } from "../../../../domain/ports/PokemonDetailRepository";

const mockGrassPokemonList = [
  new PokemonReference("bulbasaur"),
  new PokemonReference("ivysaur"),
  new PokemonReference("venusaur"),
  new PokemonReference("oddish"),
];

export const createMockPokemonDetailRepository =
  (): PokemonDetailRepository => {
    return {
      findAllByType: vi.fn().mockResolvedValue(mockGrassPokemonList),
      findByName: vi.fn(),
      findEvolutionChainUrl: vi.fn(),
      findEvolutionChain: vi.fn(),
    };
  };

export const createMockPokemonDetailRepositoryWithError = (
  error: Error,
): PokemonDetailRepository => {
  return {
    findAllByType: vi.fn().mockRejectedValue(error),
    findByName: vi.fn(),
    findEvolutionChainUrl: vi.fn(),
    findEvolutionChain: vi.fn(),
  };
};
