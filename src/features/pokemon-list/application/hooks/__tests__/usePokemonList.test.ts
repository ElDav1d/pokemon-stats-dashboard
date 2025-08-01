import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonList from "../usePokemonList";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonType } from "../../../domain/value-objects/PokemonType";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";

let mockRepository: PokemonRepository;
let mockPokemonsByType: PokemonByType[];
let mockPokemonsByName: PokemonByName[];

beforeEach(() => {
  mockPokemonsByType = [
    new PokemonByType("bulbasaur", "https://pokeapi.co/api/v2/pokemon/1/"),
    new PokemonByType("ivysaur", "https://pokeapi.co/api/v2/pokemon/2/"),
    new PokemonByType("venusaur", "https://pokeapi.co/api/v2/pokemon/3/"),
  ];

  mockPokemonsByName = [
    new PokemonByName(
      "bulbasaur",
      70,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    ),
    new PokemonByName(
      "ivysaur",
      100,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
    ),
    new PokemonByName(
      "venusaur",
      200,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
    ),
  ];

  mockRepository = {
    findAllByType: vi.fn().mockResolvedValue(mockPokemonsByType),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(mockPokemonsByName[0])
      .mockResolvedValueOnce(mockPokemonsByName[1])
      .mockResolvedValueOnce(mockPokemonsByName[2]),
  };
});

it("returns a list of Pokemon items with the required values", async () => {
  const { result } = renderHook(() => usePokemonList("grass", mockRepository));

  // Initially should be empty, but loading may have already started
  expect(result.current.pokemonList).toEqual([]);
  expect(result.current.isError).toBe(false);

  // Should start or be loading
  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  // Wait for the effect to complete
  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  // Verify repository was called with correct type
  expect(mockRepository.findAllByType).toHaveBeenCalledWith(
    expect.any(PokemonType)
  );

  // Verify each Pokemon item has required properties
  result.current.pokemonList.forEach((pokemon, index) => {
    expect(pokemon.id).toBeDefined();
    expect(pokemon.name).toBe(mockPokemonsByType[index].name);
    expect(pokemon.url).toBe(mockPokemonsByType[index].url);
    expect(pokemon.height).toBe(mockPokemonsByName[index].height);
    expect(pokemon.imageUrl).toBe(mockPokemonsByName[index].imageUrl);
  });

  // Verify findDetailsByName was called for each pokemon
  expect(mockRepository.findDetailsByName).toHaveBeenCalledTimes(3);
  expect(mockRepository.findDetailsByName).toHaveBeenCalledWith("bulbasaur");
  expect(mockRepository.findDetailsByName).toHaveBeenCalledWith("ivysaur");
  expect(mockRepository.findDetailsByName).toHaveBeenCalledWith("venusaur");
});

it("returns empty array when selectedType is empty", async () => {
  const { result } = renderHook(() => usePokemonList("", mockRepository));

  await waitFor(() => {
    expect(result.current.pokemonList).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  expect(mockRepository.findAllByType).not.toHaveBeenCalled();
});

it("handles repository errors gracefully", async () => {
  const errorRepository: PokemonRepository = {
    findAllByType: vi.fn().mockRejectedValue(new Error("API Error")),
    findDetailsByName: vi.fn(),
  };

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result } = renderHook(() => usePokemonList("fire", errorRepository));

  // Should start loading
  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  // Should end with error state
  await waitFor(() => {
    expect(result.current.pokemonList).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  expect(consoleSpy).toHaveBeenCalledWith(
    "Error fetching pokemon list:",
    expect.any(Error)
  );

  consoleSpy.mockRestore();
});

it("shows loading state during fetch", async () => {
  // Create a delayed mock to better test loading state
  const delayedPromise = new Promise((resolve) => {
    setTimeout(() => resolve(mockPokemonsByType), 100);
  });

  const delayedRepository: PokemonRepository = {
    findAllByType: vi.fn().mockImplementation(() => delayedPromise),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(mockPokemonsByName[0])
      .mockResolvedValueOnce(mockPokemonsByName[1])
      .mockResolvedValueOnce(mockPokemonsByName[2]),
  };

  const { result } = renderHook(() =>
    usePokemonList("grass", delayedRepository)
  );

  // Initially should be empty and no error
  expect(result.current.pokemonList).toEqual([]);
  expect(result.current.isError).toBe(false);

  // Should be loading after effect triggers
  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  // Should finish loading with data
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.pokemonList.length).toBe(3);
  });
});

it("resets error state when successful fetch happens after error", async () => {
  const errorThenSuccessRepository: PokemonRepository = {
    findAllByType: vi
      .fn()
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce(mockPokemonsByType),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(mockPokemonsByName[0])
      .mockResolvedValueOnce(mockPokemonsByName[1])
      .mockResolvedValueOnce(mockPokemonsByName[2]),
  };

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result, rerender } = renderHook(
    ({ selectedType }) =>
      usePokemonList(selectedType, errorThenSuccessRepository),
    { initialProps: { selectedType: "fire" } }
  );

  // Wait for error state
  await waitFor(() => {
    expect(result.current.isError).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.pokemonList).toEqual([]);
  });

  // Change type to trigger new fetch
  rerender({ selectedType: "grass" });

  // Should reset error and load successfully
  await waitFor(() => {
    expect(result.current.isError).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.pokemonList.length).toBe(3);
  });

  consoleSpy.mockRestore();
});

it("updates pokemon list when selectedType changes", async () => {
  const newMockPokemonsByType = [
    new PokemonByType("charmander", "https://pokeapi.co/api/v2/pokemon/4/"),
  ];
  const newMockPokemonByName = new PokemonByName(
    "charmander",
    60,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
  );

  // Set up mock to return different data on subsequent calls
  const mockFindAllByType = vi
    .fn()
    .mockResolvedValueOnce(mockPokemonsByType)
    .mockResolvedValueOnce(newMockPokemonsByType);

  const mockFindDetailsByName = vi
    .fn()
    .mockResolvedValueOnce(mockPokemonsByName[0])
    .mockResolvedValueOnce(mockPokemonsByName[1])
    .mockResolvedValueOnce(mockPokemonsByName[2])
    .mockResolvedValueOnce(newMockPokemonByName);

  const repoWithChangingData: PokemonRepository = {
    findAllByType: mockFindAllByType,
    findDetailsByName: mockFindDetailsByName,
  };

  const { result, rerender } = renderHook(
    ({ selectedType }) => usePokemonList(selectedType, repoWithChangingData),
    { initialProps: { selectedType: "grass" } }
  );

  // Wait for initial load
  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  // Change the type
  rerender({ selectedType: "fire" });

  // Should start loading
  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  // Wait for new data
  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(1);
    expect(result.current.pokemonList[0].name).toBe("charmander");
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  expect(mockFindAllByType).toHaveBeenCalledTimes(2);
});
