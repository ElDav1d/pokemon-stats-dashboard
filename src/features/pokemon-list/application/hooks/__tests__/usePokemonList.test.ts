import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect } from "vitest";
import usePokemonList from "../usePokemonList";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";

import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";
import { testData } from "./setupTests";

it("returns a list of Pokemon items with the required values", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
  });

  result.current.pokemonList.forEach((pokemon, index) => {
    expect(pokemon.id).toBeDefined();
    expect(pokemon.name).toBe(testData.mockPokemonsByType[index].name);
    expect(pokemon.url).toBe(testData.mockPokemonsByType[index].url);
    expect(pokemon.height).toBe(testData.mockPokemonsByName[index].height);
    expect(pokemon.imageUrl).toBe(testData.mockPokemonsByName[index].imageUrl);
  });
});

it("returns empty array when selectedType is empty", async () => {
  const { result } = renderHook(() =>
    usePokemonList("", testData.mockRepository!)
  );

  expect(result.current.pokemonList).toEqual([]);
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

  const mockFindAllByType = vi
    .fn()
    .mockResolvedValueOnce(testData.mockPokemonsByType)
    .mockResolvedValueOnce(newMockPokemonsByType);

  const mockFindDetailsByName = vi
    .fn()
    .mockResolvedValueOnce(testData.mockPokemonsByName[0])
    .mockResolvedValueOnce(testData.mockPokemonsByName[1])
    .mockResolvedValueOnce(testData.mockPokemonsByName[2])
    .mockResolvedValueOnce(newMockPokemonByName);

  const repoWithChangingData: PokemonRepository = {
    findAllByType: mockFindAllByType,
    findDetailsByName: mockFindDetailsByName,
  };

  const { result, rerender } = renderHook(
    ({ selectedType }) => usePokemonList(selectedType, repoWithChangingData),
    { initialProps: { selectedType: "grass" } }
  );

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
  });

  rerender({ selectedType: "fire" });

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(1);
    expect(result.current.pokemonList[0].name).toBe("charmander");
  });
});

it("clears pokemon list when error occurs", async () => {
  const errorRepository: PokemonRepository = {
    findAllByType: vi.fn().mockRejectedValue(new Error("API Error")),
    findDetailsByName: vi.fn(),
  };

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result } = renderHook(() => usePokemonList("fire", errorRepository));

  await waitFor(() => {
    expect(result.current.pokemonList).toEqual([]);
  });

  consoleSpy.mockRestore();
});
