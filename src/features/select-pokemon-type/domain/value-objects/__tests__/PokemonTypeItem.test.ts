import { it, expect } from "vitest";
import { PokemonTypeItem } from "../PokemonTypeItem";

it("creates a valid pokemon type item", () => {
  const item = new PokemonTypeItem(
    "fire",
    "https://pokeapi.co/api/v2/type/10/"
  );

  expect(item.name).toBe("fire");
  expect(item.url).toBe("https://pokeapi.co/api/v2/type/10/");
});

it("throws error when name is empty", () => {
  expect(() => {
    new PokemonTypeItem("", "https://pokeapi.co/api/v2/type/10/");
  }).toThrow("Pokemon type name cannot be empty");
});

it("throws error when name is only whitespace", () => {
  expect(() => {
    new PokemonTypeItem("   ", "https://pokeapi.co/api/v2/type/10/");
  }).toThrow("Pokemon type name cannot be empty");
});

it("throws error when URL is empty", () => {
  expect(() => {
    new PokemonTypeItem("fire", "");
  }).toThrow("Pokemon type URL must be a valid HTTP URL");
});

it("throws error when URL is invalid", () => {
  expect(() => {
    new PokemonTypeItem("fire", "not-a-url");
  }).toThrow("Pokemon type URL must be a valid HTTP URL");
});
