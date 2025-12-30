import { vi } from "vitest";
import { PokemonByType } from "../../../shared/domain/value-objects";
import { PokemonByName } from "../domain/value-objects/PokemonByName";
import { PokemonListItem } from "../domain/entities/PokemonListItem";
import { PokemonRepository } from "../domain/ports/PokemonRepository";

// Mock PokemonByType instances for GetPokemonListUseCase tests
export const mockPokemonByTypeCharmander = new PokemonByType("charmander");
export const mockPokemonByTypeVulpixForGetUseCase = new PokemonByType("vulpix");

// Mock PokemonByName instances for GetPokemonListUseCase tests
export const mockPokemonByNameCharmanderForGetUseCase = new PokemonByName(
  "charmander",
  5,
  "imgUrl1"
);
export const mockPokemonByNameVulpixForGetUseCase = new PokemonByName(
  "vulpix",
  6,
  "imgUrl2"
);

// Mock repository factory for GetPokemonListUseCase tests
export const createMockPokemonRepository = (
  pokemonsByType: PokemonByType[] = [
    mockPokemonByTypeCharmander,
    mockPokemonByTypeVulpixForGetUseCase,
  ],
  detailsList: PokemonByName[] = [
    mockPokemonByNameCharmanderForGetUseCase,
    mockPokemonByNameVulpixForGetUseCase,
  ]
): PokemonRepository => {
  const findDetailsByName = vi.fn();

  for (const details of detailsList) {
    findDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: vi.fn().mockResolvedValue(pokemonsByType),
    findDetailsByName,
  };
};

// Mock repository factory for error scenarios
export const createMockPokemonRepositoryWithError = (
  error: Error
): PokemonRepository => ({
  findAllByType: vi.fn().mockRejectedValue(error),
  findDetailsByName: vi.fn(),
});

// Mock repository factory for delayed responses (loading state tests)
export const createDelayedPromise = <T>(value: T, delay = 50): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), delay);
  });
};

export const createMockPokemonRepositoryWithDelay = (
  pokemonsByType: PokemonByType[],
  detailsList: PokemonByName[],
  delay = 50
): PokemonRepository => {
  const findDetailsByName = vi.fn();

  for (const details of detailsList) {
    findDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: vi
      .fn()
      .mockImplementation(() => createDelayedPromise(pokemonsByType, delay)),
    findDetailsByName,
  };
};

// Mock repository factory for error-then-success scenarios
export const createMockPokemonRepositoryErrorThenSuccess = (
  pokemonsByType: PokemonByType[],
  detailsList: PokemonByName[]
): PokemonRepository => {
  const findDetailsByName = vi.fn();

  for (const details of detailsList) {
    findDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: vi
      .fn()
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce(pokemonsByType),
    findDetailsByName,
  };
};

// Mock repository factory for changing data scenarios (rerender tests)
export const createMockPokemonRepositoryWithChangingData = (
  firstPokemonsByType: PokemonByType[],
  firstDetailsList: PokemonByName[],
  secondPokemonsByType: PokemonByType[],
  secondDetailsList: PokemonByName[]
): PokemonRepository => {
  const mockFindAllByType = vi
    .fn()
    .mockResolvedValueOnce(firstPokemonsByType)
    .mockResolvedValueOnce(secondPokemonsByType);

  const mockFindDetailsByName = vi.fn();

  // First batch of details
  for (const details of firstDetailsList) {
    mockFindDetailsByName.mockResolvedValueOnce(details);
  }

  // Second batch of details
  for (const details of secondDetailsList) {
    mockFindDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: mockFindAllByType,
    findDetailsByName: mockFindDetailsByName,
  };
};

// Mock PokemonByType instances for PokemonListViewModel tests
export const mockPokemonByTypeCharizard = new PokemonByType("charizard");

export const mockPokemonByTypeVulpix = new PokemonByType("vulpix");

// Mock PokemonByName instances for PokemonListViewModel tests
export const mockPokemonByNameCharizard = new PokemonByName(
  "charizard",
  17,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
);

export const mockPokemonByNameVulpix = new PokemonByName(
  "vulpix",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
);

export const mockPokemonByNameCharmander = new PokemonByName(
  "charmander",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
);

// Mock PokemonListItem instances for sort tests (PokemonListViewModel)
export const mockPokemonListItemCharizard = new PokemonListItem(
  "1",
  "charizard",
  20,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
);

export const mockPokemonListItemVulpix = new PokemonListItem(
  "2",
  "vulpix",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
);

export const mockPokemonListItemCharmander = new PokemonListItem(
  "3",
  "charmander",
  5,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
);

// Mock PokemonListItem instances for SortPokemonsByHeightUseCase tests
export const mockPokemonListItemBulbasaur = new PokemonListItem(
  "1",
  "bulbasaur",
  7,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
);

export const mockPokemonListItemIvysaur = new PokemonListItem(
  "2",
  "ivysaur",
  20,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
);

export const mockPokemonListItemVenusaur = new PokemonListItem(
  "3",
  "venusaur",
  12,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
);

// Mock data for hook integration tests
export const mockPokemonsByTypeForHookTests = [
  new PokemonByType("bulbasaur"),
  new PokemonByType("ivysaur"),
  new PokemonByType("venusaur"),
];

export const mockPokemonsByNameForHookTests = [
  new PokemonByName(
    "bulbasaur",
    7,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  ),
  new PokemonByName(
    "ivysaur",
    10,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
  ),
  new PokemonByName(
    "venusaur",
    20,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
  ),
];

// Mock repository for successful hook tests
export const createMockPokemonRepositoryForHookTests =
  (): PokemonRepository => {
    return createMockPokemonRepository(
      mockPokemonsByTypeForHookTests,
      mockPokemonsByNameForHookTests
    );
  };
