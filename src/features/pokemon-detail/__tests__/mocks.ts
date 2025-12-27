import { vi } from "vitest";
import { PokemonDetail } from "../domain/entities/PokemonDetail";
import { EvolutionChain } from "../domain/entities/EvolutionChain";
import { PokemonStat } from "../domain/value-objects/PokemonStat";
import { PokemonDetailRepository } from "../domain/ports/PokemonDetailRepository";

export const mockBulbasaurStats: PokemonStat[] = [
  new PokemonStat("hp", 45, 0),
  new PokemonStat("attack", 49, 0),
  new PokemonStat("defense", 49, 0),
  new PokemonStat("special-attack", 65, 1),
  new PokemonStat("special-defense", 65, 0),
  new PokemonStat("speed", 45, 0),
];

export const mockBulbasaurDetail = new PokemonDetail(
  1,
  "bulbasaur",
  7,
  69,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  mockBulbasaurStats,
  ["grass", "poison"],
  "https://pokeapi.co/api/v2/pokemon-species/1/"
);

export const mockBulbasaurEvolutionChain = new EvolutionChain([
  "bulbasaur",
  "ivysaur",
  "venusaur",
]);

export const createMockPokemonDetailRepository = (
  detail: PokemonDetail = mockBulbasaurDetail,
  evolutionChain: EvolutionChain = mockBulbasaurEvolutionChain
): PokemonDetailRepository => ({
  findByName: vi.fn().mockResolvedValue(detail),
  findEvolutionChainUrl: vi.fn().mockResolvedValue("https://pokeapi.co/api/v2/evolution-chain/1/"),
  findEvolutionChain: vi.fn().mockResolvedValue(evolutionChain),
  findAllByType: vi.fn(),
});

export const createMockPokemonDetailRepositoryWithError = (
  error: Error
): PokemonDetailRepository => ({
  findByName: vi.fn().mockRejectedValue(error),
  findEvolutionChainUrl: vi.fn().mockRejectedValue(error),
  findEvolutionChain: vi.fn().mockRejectedValue(error),
  findAllByType: vi.fn().mockRejectedValue(error),
});
