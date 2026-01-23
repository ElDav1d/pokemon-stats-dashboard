import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonsByType from "../usePokemonsByType";
import {
  createMockPokemonDetailRepository,
  createMockPokemonDetailRepositoryWithError,
} from "../../../../__tests__/mocks";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

it("returns empty pokemon list initially", () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  expect(result.current.pokemonNames).toEqual([]);
  expect(result.current.selectedType).toBeNull();
  expect(result.current.isLoading).toBe(false);
});

it("loads pokemon list when selectType is called", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("grass");
  });

  await waitFor(() => {
    expect(result.current.pokemonNames).toEqual([
      "bulbasaur",
      "ivysaur",
      "venusaur",
      "oddish",
    ]);
  });
});

it("updates selectedType when selectType is called", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("fire");
  });

  expect(result.current.selectedType).toBe("fire");
});

it("updates selectedType when selectType is called", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("fire");
  });

  expect(result.current.selectedType).toBe("fire");
});

it("returns isLoading true while fetching", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("grass");
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it("returns isError true when fetch fails", async () => {
  const mockRepository = createMockPokemonDetailRepositoryWithError(
    new Error("API Error"),
  );

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("grass");
  });

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
});
