import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach, afterEach } from "vitest";
import usePokemonList from "../usePokemonList";
import { testData } from "./setupTests";
import * as reduxHooks from "../../../../../../infrastructure/redux/hooks";

beforeEach(() => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("returns unsorted list when sortByHeight is false", async () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);

  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
    expect(result.current.pokemonList[0].name).toBe("bulbasaur");
    expect(result.current.pokemonList[1].name).toBe("ivysaur");
    expect(result.current.pokemonList[2].name).toBe("venusaur");
  });
});

it("returns sorted list when sortByHeight is true", async () => {
  vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(true);

  const { result } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
    expect(result.current.pokemonList[0].height).toBe(7);
    expect(result.current.pokemonList[1].height).toBe(10);
    expect(result.current.pokemonList[2].height).toBe(20);
  });
});

it("re-sorts list when sortByHeight changes from false to true", async () => {
  const mockSelector = vi.spyOn(reduxHooks, "useAppSelector").mockReturnValue(false);

  const { result, rerender } = renderHook(() =>
    usePokemonList("grass", testData.mockRepository!)
  );

  await waitFor(() => {
    expect(result.current.pokemonList.length).toBe(3);
    expect(result.current.pokemonList[0].name).toBe("bulbasaur");
  });

  mockSelector.mockReturnValue(true);
  rerender();

  await waitFor(() => {
    expect(result.current.pokemonList[0].height).toBe(7);
    expect(result.current.pokemonList[2].height).toBe(20);
  });
});
