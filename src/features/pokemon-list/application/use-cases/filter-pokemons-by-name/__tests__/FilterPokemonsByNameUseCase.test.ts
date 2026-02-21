import { it, expect } from "vitest";
import { FilterPokemonsByNameUseCase } from "../FilterPokemonsByNameUseCase";
import {
  mockPokemonListItemBulbasaur,
  mockPokemonListItemIvysaur,
  mockPokemonListItemVenusaur,
} from "../../../../__tests__/mocks";

const list = [
  mockPokemonListItemBulbasaur,
  mockPokemonListItemIvysaur,
  mockPokemonListItemVenusaur,
];

it("returns the full list when query is empty", () => {
  const result = FilterPokemonsByNameUseCase.execute(list, "");

  expect(result).toHaveLength(3);
  expect(result).toEqual(list);
});

it("returns matching pokemon when query matches a name partially", () => {
  const result = FilterPokemonsByNameUseCase.execute(list, "saur");

  expect(result).toHaveLength(3);
  expect(result[0].name).toBe("bulbasaur");
  expect(result[1].name).toBe("ivysaur");
  expect(result[2].name).toBe("venusaur");
});

it("filters case-insensitively", () => {
  const result = FilterPokemonsByNameUseCase.execute(list, "BULBA");

  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("bulbasaur");
});

it("returns empty array when no pokemon matches", () => {
  const result = FilterPokemonsByNameUseCase.execute(list, "pikachu");

  expect(result).toHaveLength(0);
});
