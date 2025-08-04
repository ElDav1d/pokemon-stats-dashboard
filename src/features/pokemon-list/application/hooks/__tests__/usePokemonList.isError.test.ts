import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect } from "vitest";
import usePokemonList from "../usePokemonList";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { testData } from "./setupTests";

it("starts as false when no selectedType is provided", () => {
  const { result } = renderHook(() =>
    usePokemonList("", testData.mockRepository!)
  );

  expect(result.current.isError).toBe(false);
});

it("remains false during successful fetch", async () => {
  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  expect(result.current.isError).toBe(false);

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
  });

  expect(result.current.isError).toBe(false);
});

it("resets to false when successful fetch happens after error", async () => {
  const errorThenSuccessRepository: PokemonRepository = {
    findAllByType: vi
      .fn()
      .mockRejectedValueOnce(new Error("API Error"))
      .mockResolvedValueOnce(testData.mockPokemonsByType),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(testData.mockPokemonsByName[0])
      .mockResolvedValueOnce(testData.mockPokemonsByName[1])
      .mockResolvedValueOnce(testData.mockPokemonsByName[2]),
  };

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result, rerender } = renderHook(
    ({ selectedType }) =>
      usePokemonList(selectedType, errorThenSuccessRepository),
    { initialProps: { selectedType: "fire" } }
  );

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });

  rerender({ selectedType: "grass" });

  await waitFor(() => {
    expect(result.current.isError).toBe(false);
    expect(result.current.pokemonList.length).toBe(3);
  });

  consoleSpy.mockRestore();
});

it("resets to false when selectedType becomes empty", async () => {
  const errorRepository: PokemonRepository = {
    findAllByType: vi.fn().mockRejectedValue(new Error("API Error")),
    findDetailsByName: vi.fn(),
  };

  const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

  const { result, rerender } = renderHook(
    ({ selectedType }) => usePokemonList(selectedType, errorRepository),
    { initialProps: { selectedType: "fire" } }
  );

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });

  rerender({ selectedType: "" });

  expect(result.current.isError).toBe(false);

  consoleSpy.mockRestore();
});
