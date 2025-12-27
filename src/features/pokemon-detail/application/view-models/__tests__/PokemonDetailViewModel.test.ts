import { it, expect } from "vitest";
import { PokemonDetailViewModel } from "../PokemonDetailViewModel";
import {
  mockBulbasaurDetail,
  mockBulbasaurEvolutionChain,
  createMockPokemonDetailRepository,
} from "../../../__tests__/mocks";

it("loads pokemon detail by name", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const viewModel = new PokemonDetailViewModel(mockRepository);
  const result = await viewModel.loadPokemonDetail("bulbasaur");

  expect(result).toBe(mockBulbasaurDetail);
});

it("returns null when name is empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = await viewModel.loadPokemonDetail("");

  expect(result).toBeNull();
  expect(mockRepository.findByName).not.toHaveBeenCalled();
});

it("loads evolution chain from species URL", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const viewModel = new PokemonDetailViewModel(mockRepository);
  const result = await viewModel.loadEvolutionChain(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );

  expect(result).toBe(mockBulbasaurEvolutionChain);
});

it("returns null evolution chain when species URL is empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = await viewModel.loadEvolutionChain("");

  expect(result).toBeNull();
});

it("gets evolutions excluding current pokemon", () => {
  const mockRepository = createMockPokemonDetailRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = viewModel.getEvolutionsExcluding(
    mockBulbasaurEvolutionChain,
    "bulbasaur"
  );

  expect(result).toEqual(["ivysaur", "venusaur"]);
});

it("returns empty array when evolution chain is null", () => {
  const mockRepository = createMockPokemonDetailRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = viewModel.getEvolutionsExcluding(null, "bulbasaur");

  expect(result).toEqual([]);
});
