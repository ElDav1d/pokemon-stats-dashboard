import { it, expect } from "vitest";
import { PokemonType } from "../../../../../shared/domain/value-objects/PokemonType";
import { PokemonListViewModel } from "../PokemonListViewModel";
import {
  createMockPokemonRepository,
  mockPokemonReferenceCharizard,
  mockPokemonReferenceVulpix,
  mockPokemonItemCharizard,
  mockPokemonItemVulpix,
  mockPokemonListItemCharizard,
  mockPokemonListItemVulpix,
  mockPokemonListItemCharmander,
  mockPokemonListItemBulbasaur,
  mockPokemonListItemIvysaur,
  mockPokemonListItemVenusaur,
} from "../../../__tests__/mocks";

it("should load pokemon list by type", async () => {
  const mockRepository = createMockPokemonRepository(
    [mockPokemonReferenceCharizard, mockPokemonReferenceVulpix],
    [mockPokemonItemCharizard, mockPokemonItemVulpix]
  );

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = await viewModel.loadPokemonList("fire");

  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("charizard");
  expect(result[1].name).toBe("vulpix");
  expect(mockRepository.findAllByType).toHaveBeenCalledWith(
    new PokemonType("fire")
  );
});

it("should return empty array when type is empty", async () => {
  const mockRepository = createMockPokemonRepository([], []);

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = await viewModel.loadPokemonList("");

  expect(result).toEqual([]);
  expect(mockRepository.findAllByType).not.toHaveBeenCalled();
});

it("should filter pokemon list by name matching a partial query", () => {
  const mockRepository = createMockPokemonRepository([], []);

  const list = [
    mockPokemonListItemBulbasaur,
    mockPokemonListItemIvysaur,
    mockPokemonListItemVenusaur,
  ];

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = viewModel.filterPokemonsByName(list, "saur");

  expect(result).toHaveLength(3);
  expect(result[0].name).toBe("bulbasaur");
  expect(result[1].name).toBe("ivysaur");
  expect(result[2].name).toBe("venusaur");
});

it("should return the full list when filter query is empty", () => {
  const mockRepository = createMockPokemonRepository([], []);

  const list = [
    mockPokemonListItemBulbasaur,
    mockPokemonListItemIvysaur,
    mockPokemonListItemVenusaur,
  ];

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = viewModel.filterPokemonsByName(list, "");

  expect(result).toHaveLength(3);
});

it("should sort pokemon list by height", () => {
  const mockRepository = createMockPokemonRepository([], []);

  const unsortedList = [
    mockPokemonListItemCharizard,
    mockPokemonListItemVulpix,
    mockPokemonListItemCharmander,
  ];

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = viewModel.sortPokemonListByHeight(unsortedList);

  expect(result[0].height).toBe(5);
  expect(result[1].height).toBe(6);
  expect(result[2].height).toBe(20);
});
