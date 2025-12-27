import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonList from "../usePokemonList";
import * as reduxHooks from "../../../../../../shared/infrastructure/redux/hooks";

import { testData } from "./setupTests";
import {
  createMockPokemonRepositoryErrorThenSuccess,
  createMockPokemonRepositoryWithError,
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
  const errorThenSuccessRepository =
    createMockPokemonRepositoryErrorThenSuccess(
      mockPokemonsByTypeForHookTests,
      mockPokemonsByNameForHookTests
    );

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
  const errorRepository = createMockPokemonRepositoryWithError(
    new Error("API Error")
  );

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
