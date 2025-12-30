import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonList from "../usePokemonList";
import * as reduxHooks from "../../../../../../shared/infrastructure/redux/hooks";
import { PokemonReference } from "../../../../../../shared/domain/value-objects";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";
import { testData } from "./setupTests";
import {
  createMockPokemonRepositoryWithChangingData,
  createMockPokemonRepositoryWithError,
  mockPokemonReferencesForHookTests,
  mockPokemonsByNameForHookTests,
} from "../../../../__tests__/mocks";

beforeEach(() => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
});

it("returns a list of Pokemon items with the required values", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
  });

  result.current.pokemonList.forEach((pokemon, index) => {
    expect(pokemon.id).toBeDefined();
    expect(pokemon.name).toBe(testData.mockPokemonReferences[index].name);
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
  const newMockPokemonReferences = [new PokemonReference("charmander")];
  const newMockPokemonByName = new PokemonByName(
    "charmander",
    60,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
  );

  const repoWithChangingData = createMockPokemonRepositoryWithChangingData(
    mockPokemonReferencesForHookTests,
    mockPokemonsByNameForHookTests,
    newMockPokemonReferences,
    [newMockPokemonByName]
  );

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
  const errorRepository = createMockPokemonRepositoryWithError(
    new Error("API Error")
  );

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result } = renderHook(() => usePokemonList("fire", errorRepository));

  await waitFor(() => {
    expect(result.current.pokemonList).toEqual([]);
  });

  consoleSpy.mockRestore();
});
