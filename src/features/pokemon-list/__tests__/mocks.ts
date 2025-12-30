import { vi } from "vitest";
import { PokemonReference } from "../../../shared/domain/value-objects";
import { PokemonItem } from "../domain/value-objects/PokemonItem";
import { PokemonListItem } from "../domain/entities/PokemonListItem";
import { PokemonRepository } from "../domain/ports/PokemonRepository";

// Mock PokemonReference instances for GetPokemonListUseCase tests
export const mockPokemonReferenceCharmander = new PokemonReference("charmander");
export const mockPokemonReferenceVulpixForGetUseCase = new PokemonReference("vulpix");

// Mock PokemonItem instances for GetPokemonListUseCase tests
export const mockPokemonItemCharmanderForGetUseCase = new PokemonItem(
  "charmander",
  5,
  "imgUrl1"
);
export const mockPokemonItemVulpixForGetUseCase = new PokemonItem(
  "vulpix",
  6,
  "imgUrl2"
);

// Mock repository factory for GetPokemonListUseCase tests
export const createMockPokemonRepository = (
  pokemonReferences: PokemonReference[] = [
    mockPokemonReferenceCharmander,
    mockPokemonReferenceVulpixForGetUseCase,
  ],
  detailsList: PokemonItem[] = [
    mockPokemonItemCharmanderForGetUseCase,
    mockPokemonItemVulpixForGetUseCase,
  ]
): PokemonRepository => {
  const findDetailsByName = vi.fn();

  for (const details of detailsList) {
    findDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: vi.fn().mockResolvedValue(pokemonReferences),
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
  pokemonReferences: PokemonReference[],
  detailsList: PokemonItem[],
  delay = 50
): PokemonRepository => {
  const findDetailsByName = vi.fn();

  for (const details of detailsList) {
    findDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: vi
      .fn()
      .mockImplementation(() => createDelayedPromise(pokemonReferences, delay)),
    findDetailsByName,
  };
};

// Mock repository factory for error-then-success scenarios
export const createMockPokemonRepositoryErrorThenSuccess = (
  pokemonReferences: PokemonReference[],
  detailsList: PokemonItem[]
): PokemonRepository => {
  const findDetailsByName = vi.fn();

  for (const details of detailsList) {
    findDetailsByName.mockResolvedValueOnce(details);
  }

  return {
    findAllByType: vi
      .fn()
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce(pokemonReferences),
    findDetailsByName,
  };
};

// Mock repository factory for changing data scenarios (rerender tests)
export const createMockPokemonRepositoryWithChangingData = (
  firstPokemonReferences: PokemonReference[],
  firstDetailsList: PokemonItem[],
  secondPokemonReferences: PokemonReference[],
  secondDetailsList: PokemonItem[]
): PokemonRepository => {
  const mockFindAllByType = vi
    .fn()
    .mockResolvedValueOnce(firstPokemonReferences)
    .mockResolvedValueOnce(secondPokemonReferences);

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

// Mock PokemonReference instances for PokemonListViewModel tests
export const mockPokemonReferenceCharizard = new PokemonReference("charizard");

export const mockPokemonReferenceVulpix = new PokemonReference("vulpix");

// Mock PokemonItem instances for PokemonListViewModel tests
export const mockPokemonItemCharizard = new PokemonItem(
  "charizard",
  17,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
);

export const mockPokemonItemVulpix = new PokemonItem(
  "vulpix",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
);

export const mockPokemonItemCharmander = new PokemonItem(
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
export const mockPokemonReferencesForHookTests = [
  new PokemonReference("bulbasaur"),
  new PokemonReference("ivysaur"),
  new PokemonReference("venusaur"),
];

export const mockPokemonsByNameForHookTests = [
  new PokemonItem(
    "bulbasaur",
    7,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  ),
  new PokemonItem(
    "ivysaur",
    10,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
  ),
  new PokemonItem(
    "venusaur",
    20,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
  ),
];

// Mock repository for successful hook tests
export const createMockPokemonRepositoryForHookTests =
  (): PokemonRepository => {
    return createMockPokemonRepository(
      mockPokemonReferencesForHookTests,
      mockPokemonsByNameForHookTests
    );
  };
