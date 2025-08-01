import { renderHook, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import usePokemonList from "../usePokemonList";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonType } from "../../../domain/value-objects/PokemonType";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";

describe("usePokemonList", () => {
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
    const { result } = renderHook(() =>
      usePokemonList("grass", mockRepository)
    );

    // Initially should be empty
    expect(result.current).toEqual([]);

    // Wait for the effect to complete
    await waitFor(() => {
      expect(result.current.length).toBe(3);
    });

    // Verify repository was called with correct type
    expect(mockRepository.findAllByType).toHaveBeenCalledWith(
      expect.any(PokemonType)
    );

    // Verify each Pokemon item has required properties
    result.current.forEach((pokemon, index) => {
      expect(pokemon.id).toBeDefined();
      expect(pokemon.name).toBe(mockPokemonsByType[index].name);
      expect(pokemon.url).toBe(mockPokemonsByType[index].url);
      expect(pokemon.height).toBe(mockPokemonsByName[index].height);
      expect(pokemon.imageUrl).toBe(mockPokemonsByName[index].imageUrl);
      expect(typeof pokemon.name).toBe("string");
      expect(typeof pokemon.url).toBe("string");
      expect(typeof pokemon.height).toBe("number");
      expect(typeof pokemon.imageUrl).toBe("string");
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
      expect(result.current).toEqual([]);
    });

    expect(mockRepository.findAllByType).not.toHaveBeenCalled();
  });

  it("handles repository errors gracefully", async () => {
    const errorRepository: PokemonRepository = {
      findAllByType: vi.fn().mockRejectedValue(new Error("API Error")),
      findDetailsByName: vi.fn(),
    };

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() =>
      usePokemonList("fire", errorRepository)
    );

    await waitFor(() => {
      expect(result.current).toEqual([]);
    });

    expect(consoleSpy).toHaveBeenCalledWith(
      "Error fetching pokemon list:",
      expect.any(Error)
    );

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
      expect(result.current.length).toBe(3);
    });

    // Change the type
    rerender({ selectedType: "fire" });

    // Wait for new data
    await waitFor(() => {
      expect(result.current.length).toBe(1);
      expect(result.current[0].name).toBe("charmander");
    });

    expect(mockFindAllByType).toHaveBeenCalledTimes(2);
  });
});
