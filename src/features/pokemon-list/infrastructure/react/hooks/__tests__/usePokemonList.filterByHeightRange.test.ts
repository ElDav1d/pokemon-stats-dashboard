import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach, afterEach } from "vitest";
import usePokemonList from "../usePokemonList";
import { testData } from "./setupTests";
import * as reduxHooks from "../../../../../../shared/infrastructure/redux/hooks";

// Hook test data: bulbasaur h:20, ivysaur h:10, venusaur h:7 (from setupTests)

beforeEach(() => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("returns full list when both filterByMinHeight and filterByMaxHeight are 0", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, {
      filterByMinHeight: 0,
      filterByMaxHeight: 0,
    })
  );

  await waitFor(() => {
    expect(result.current.pokemonList).toHaveLength(3);
  });
});

it("filters list by minimum height", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, { filterByMinHeight: 9 })
  );

  await waitFor(() => {
    // bulbasaur (h:20) and ivysaur (h:10) pass; venusaur (h:7) does not
    expect(result.current.pokemonList).toHaveLength(2);
    expect(result.current.pokemonList[0].name).toBe("bulbasaur");
    expect(result.current.pokemonList[1].name).toBe("ivysaur");
  });
});

it("filters list by maximum height", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, { filterByMaxHeight: 9 })
  );

  await waitFor(() => {
    // Only venusaur (h:7) passes; ivysaur (h:10) and bulbasaur (h:20) do not
    expect(result.current.pokemonList).toHaveLength(1);
    expect(result.current.pokemonList[0].name).toBe("venusaur");
  });
});

it("filters list by both min and max height", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, {
      filterByMinHeight: 8,
      filterByMaxHeight: 15,
    })
  );

  await waitFor(() => {
    // Only ivysaur (h:10) fits the range 8–15
    expect(result.current.pokemonList).toHaveLength(1);
    expect(result.current.pokemonList[0].name).toBe("ivysaur");
  });
});

it("returns empty list when minHeight is greater than maxHeight", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!, {
      filterByMinHeight: 15,
      filterByMaxHeight: 5,
    })
  );

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.pokemonList).toHaveLength(0);
});
