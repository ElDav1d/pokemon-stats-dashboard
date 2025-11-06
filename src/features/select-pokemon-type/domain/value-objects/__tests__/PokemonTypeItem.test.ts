import { it, expect } from "vitest";
import { PokemonTypeItem } from "../PokemonTypeItem";

it("creates a valid pokemon type item", () => {
  const item = new PokemonTypeItem("fire");

  expect(item.name).toBe("fire");
});

it("throws error when name is empty", () => {
  expect(() => {
    new PokemonTypeItem("");
  }).toThrow("Pokemon type name cannot be empty");
});

it("throws error when name is only whitespace", () => {
  expect(() => {
    new PokemonTypeItem("   ");
  }).toThrow("Pokemon type name cannot be empty");
});
