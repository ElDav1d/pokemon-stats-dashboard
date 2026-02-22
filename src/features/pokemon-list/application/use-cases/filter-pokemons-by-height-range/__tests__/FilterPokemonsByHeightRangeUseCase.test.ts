import { it, expect } from "vitest";
import { FilterPokemonsByHeightRangeUseCase } from "../FilterPokemonsByHeightRangeUseCase";
import {
  mockPokemonListItemBulbasaur,
  mockPokemonListItemIvysaur,
  mockPokemonListItemVenusaur,
} from "../../../../__tests__/mocks";

// bulbasaur: h:7, ivysaur: h:20, venusaur: h:12
const list = [
  mockPokemonListItemBulbasaur,
  mockPokemonListItemIvysaur,
  mockPokemonListItemVenusaur,
];

it("returns the full list when both min and max are 0", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 0, 0);

  expect(result).toHaveLength(3);
  expect(result).toEqual(list);
});

it("returns the full list when both min and max are undefined", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, undefined, undefined);

  expect(result).toHaveLength(3);
  expect(result).toEqual(list);
});

it("filters by min height when only minHeight is provided", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 10, 0);

  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("ivysaur");
  expect(result[1].name).toBe("venusaur");
});

it("filters by max height when only maxHeight is provided", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 0, 10);

  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("bulbasaur");
});

it("filters by both min and max when both are valid", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 8, 15);

  expect(result).toHaveLength(1);
  expect(result[0].name).toBe("venusaur");
});

it("returns empty array when minHeight is greater than maxHeight", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 15, 5);

  expect(result).toHaveLength(0);
});

it("includes pokemon whose height equals minHeight", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 7, 0);

  expect(result).toHaveLength(3);
  expect(result[0].name).toBe("bulbasaur");
});

it("includes pokemon whose height equals maxHeight", () => {
  const result = FilterPokemonsByHeightRangeUseCase.execute(list, 0, 12);

  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("bulbasaur");
  expect(result[1].name).toBe("venusaur");
});
