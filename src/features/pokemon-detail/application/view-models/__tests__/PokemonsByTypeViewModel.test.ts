import { it, expect, vi } from "vitest";
import { PokemonsByTypeViewModel } from "../PokemonsByTypeViewModel";
import { PokemonReference } from "../../../../../shared/domain/value-objects/PokemonReference";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

it("loads pokemon list by type", async () => {
  const mockRepository = createMockRepository();
  const mockPokemonList = [
    new PokemonReference("bulbasaur"),
    new PokemonReference("ivysaur"),
  ];
  (mockRepository.findAllByType as any).mockResolvedValue(mockPokemonList);

  const viewModel = new PokemonsByTypeViewModel(mockRepository);
  const result = await viewModel.loadPokemonsByType("grass");

  expect(result).toBe(mockPokemonList);
});

it("returns empty array when type is empty", async () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonsByTypeViewModel(mockRepository);

  const result = await viewModel.loadPokemonsByType("");

  expect(result).toEqual([]);
  expect(mockRepository.findAllByType).not.toHaveBeenCalled();
});

it("returns empty array when type is null", async () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonsByTypeViewModel(mockRepository);

  const result = await viewModel.loadPokemonsByType(null as unknown as string);

  expect(result).toEqual([]);
});

it("extracts pokemon names from list", () => {
  const mockRepository = createMockRepository();
  const pokemonList = [
    new PokemonReference("bulbasaur"),
    new PokemonReference("ivysaur"),
  ];

  const viewModel = new PokemonsByTypeViewModel(mockRepository);
  const result = viewModel.getPokemonNames(pokemonList);

  expect(result).toEqual(["bulbasaur", "ivysaur"]);
});
