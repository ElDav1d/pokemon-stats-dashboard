import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect } from "vitest";
import usePokemonList from "../usePokemonList";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonByType } from "../../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";
import { testData, createDelayedPromise } from "./setupTests";

it("starts as false when no selectedType is provided", () => {
  const { result } = renderHook(() =>
    usePokemonList("", testData.mockRepository!)
  );

  expect(result.current.isLoading).toBe(false);
});

it("shows loading state during fetch", async () => {
  const delayedPromise = createDelayedPromise(testData.mockPokemonsByType);

  const delayedRepository: PokemonRepository = {
    findAllByType: vi.fn().mockImplementation(() => delayedPromise),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(testData.mockPokemonsByName[0])
      .mockResolvedValueOnce(testData.mockPokemonsByName[1])
      .mockResolvedValueOnce(testData.mockPokemonsByName[2]),
  };

  const { result } = renderHook(() =>
    usePokemonList("grass", delayedRepository)
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it("sets loading to false after successful fetch", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
    expect(result.current.pokemonList.length).toBe(3);
  });
});

it("sets loading to false after failed fetch", async () => {
  const errorRepository: PokemonRepository = {
    findAllByType: vi.fn().mockRejectedValue(new Error("API Error")),
    findDetailsByName: vi.fn(),
  };

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result } = renderHook(() => usePokemonList("fire", errorRepository));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  consoleSpy.mockRestore();
});

it("shows loading state when selectedType changes", async () => {
  const newMockPokemonsByType = [
    new PokemonByType("charmander", "https://pokeapi.co/api/v2/pokemon/4/"),
  ];
  const newMockPokemonByName = new PokemonByName(
    "charmander",
    60,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
  );

  const delayedPromise = createDelayedPromise(newMockPokemonsByType);

  const mockFindAllByType = vi
    .fn()
    .mockResolvedValueOnce(testData.mockPokemonsByType)
    .mockImplementation(() => delayedPromise);

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
    expect(result.current.isLoading).toBe(false);
  });

  rerender({ selectedType: "fire" });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(true);
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});
