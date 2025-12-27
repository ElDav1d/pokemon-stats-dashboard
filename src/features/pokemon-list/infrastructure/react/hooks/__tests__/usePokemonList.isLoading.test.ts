import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonList from "../usePokemonList";
import * as reduxHooks from "../../../../../../shared/infrastructure/redux/hooks";

import { PokemonByType } from "../../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";
import { testData } from "./setupTests";
import {
  createMockPokemonRepositoryWithDelay,
  createMockPokemonRepositoryWithError,
  createMockPokemonRepositoryWithChangingData,
  mockPokemonsByTypeForHookTests,
  mockPokemonsByNameForHookTests,
} from "../../../../__tests__/mocks";

beforeEach(() => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
});

it("starts as false when no selectedType is provided", () => {
  const { result } = renderHook(() =>
    usePokemonList("", testData.mockRepository!)
  );

  expect(result.current.isLoading).toBe(false);
});

it("shows loading state during fetch", async () => {
  const delayedRepository = createMockPokemonRepositoryWithDelay(
    mockPokemonsByTypeForHookTests,
    mockPokemonsByNameForHookTests,
    100
  );

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
  const errorRepository = createMockPokemonRepositoryWithError(
    new Error("API Error")
  );

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result } = renderHook(() => usePokemonList("fire", errorRepository));

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(true);
  });

  consoleSpy.mockRestore();
});

it("shows loading state when selectedType changes", async () => {
  const newMockPokemonsByType = [new PokemonByType("charmander")];
  const newMockPokemonByName = new PokemonByName(
    "charmander",
    60,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
  );

  const repoWithChangingData = createMockPokemonRepositoryWithChangingData(
    mockPokemonsByTypeForHookTests,
    mockPokemonsByNameForHookTests,
    newMockPokemonsByType,
    [newMockPokemonByName]
  );

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
