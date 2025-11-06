import { it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import usePokemonTypes from "../usePokemonTypes";
import { PokemonTypesRepository } from "../../../../domain/ports/PokemonTypesRepository";
import { PokemonType } from "../../../../../../shared/domain/value-objects/PokemonType";

const mockTypes = [
  new PokemonType("normal"),
  new PokemonType("fighting"),
  new PokemonType("flying"),
];

let mockRepository: PokemonTypesRepository;

beforeEach(() => {
  mockRepository = {
    findAll: vi.fn().mockResolvedValue(mockTypes),
  };
});

it("should load pokemon types on mount", async () => {
  const { result } = renderHook(() => usePokemonTypes(mockRepository));

  expect(result.current.isLoading).toBe(true);
  expect(result.current.typeNames).toEqual([]);

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.typeNames).toEqual(["normal", "fighting", "flying"]);
  expect(result.current.isError).toBe(false);
  expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
});

it("should handle errors when repository fails", async () => {
  mockRepository.findAll = vi
    .fn()
    .mockRejectedValue(new Error("Network error"));

  const { result } = renderHook(() => usePokemonTypes(mockRepository));

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.typeNames).toEqual([]);
  expect(result.current.isError).toBe(true);
});

it("should handle empty list from repository", async () => {
  mockRepository.findAll = vi.fn().mockResolvedValue([]);

  const { result } = renderHook(() => usePokemonTypes(mockRepository));

  await waitFor(() => expect(result.current.isLoading).toBe(false));

  expect(result.current.typeNames).toEqual([]);
  expect(result.current.isError).toBe(false);
});
