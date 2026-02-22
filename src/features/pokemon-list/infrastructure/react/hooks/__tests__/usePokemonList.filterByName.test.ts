import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach, afterEach } from "vitest";
import usePokemonList from "../usePokemonList";
import { testData } from "./setupTests";
import * as reduxHooks from "../../../../../../shared/infrastructure/redux/hooks";

beforeEach(() => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("returns full list when filterByName is empty", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, { filterByName: "" })
  );

  await waitFor(() => {
    expect(result.current.pokemonList).toHaveLength(3);
  });
});

it("returns only matching pokemons when filterByName is provided", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, { filterByName: "bulbasaur" })
  );

  await waitFor(() => {
    expect(result.current.pokemonList).toHaveLength(1);
    expect(result.current.pokemonList[0].name).toBe("bulbasaur");
  });
});

it("filters case-insensitively", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, { filterByName: "SAUR" })
  );

  await waitFor(() => {
    expect(result.current.pokemonList).toHaveLength(3);
    expect(result.current.pokemonList[0].name).toBe("bulbasaur");
    expect(result.current.pokemonList[1].name).toBe("ivysaur");
    expect(result.current.pokemonList[2].name).toBe("venusaur");
  });
});

it("returns empty list when no pokemon matches the filter", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, { filterByName: "pikachu" })
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.pokemonList).toHaveLength(0);
});

it("updates filtered list after debounce when filterByName changes", async () => {
  const { result, rerender } = renderHook(
    ({ filter }: { filter: string }) =>
      usePokemonList("grass", testData.mockRepository!, { filterByName: filter }),
    { initialProps: { filter: "" } }
  );

  // Initial load (no filter)
  await waitFor(() => {
    expect(result.current.pokemonList).toHaveLength(3);
  });

  // Change filter — debounce fires after 300ms, waitFor polls for 1000ms
  rerender({ filter: "bulbasaur" });

  await waitFor(() => {
    expect(result.current.pokemonList).toHaveLength(1);
    expect(result.current.pokemonList[0].name).toBe("bulbasaur");
  });
});
