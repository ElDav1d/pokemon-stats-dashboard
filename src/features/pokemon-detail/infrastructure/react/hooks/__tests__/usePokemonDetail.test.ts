import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonDetail from "../usePokemonDetail";
import {
  mockBulbasaurDetail,
  mockBulbasaurEvolutionChain,
  createMockPokemonDetailRepository,
  createMockPokemonDetailRepositoryWithError,
} from "../../../../__tests__/mocks";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

it("returns pokemon detail when name is provided", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.pokemonDetail).toEqual(mockBulbasaurDetail);
  });
});

it("returns evolution chain after loading pokemon detail", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.evolutionChain).toEqual(mockBulbasaurEvolutionChain);
  });
});

it("returns evolutions excluding current pokemon", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.evolutions).toEqual(["ivysaur", "venusaur"]);
  });
});

it("returns isLoading true while fetching", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it("returns isError true when fetch fails", async () => {
  const mockRepository = createMockPokemonDetailRepositoryWithError(new Error("API Error"));

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
});

it("returns null values when name is empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("", mockRepository));

  expect(result.current.pokemonDetail).toBeNull();
  expect(result.current.evolutionChain).toBeNull();
  expect(result.current.evolutions).toEqual([]);
  expect(result.current.isLoading).toBe(false);
});

it("clears previous data when name changes to empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result, rerender } = renderHook(
    ({ name }) => usePokemonDetail(name, mockRepository),
    { initialProps: { name: "bulbasaur" } }
  );

  await waitFor(() => {
    expect(result.current.pokemonDetail).toEqual(mockBulbasaurDetail);
  });

  rerender({ name: "" });

  expect(result.current.pokemonDetail).toBeNull();
  expect(result.current.evolutions).toEqual([]);
});
