import { it, expect } from "vitest";
import { PokemonType } from "../PokemonType";

it("creates a valid pokemon type", () => {
  const type = new PokemonType("fire");
  expect(type.value).toBe("fire");
});

it("throws error when type is empty", () => {
  expect(() => new PokemonType("")).toThrow("Pokemon type cannot be empty");
});

it("throws error when type is only whitespace", () => {
  expect(() => new PokemonType("   ")).toThrow("Pokemon type cannot be empty");
});

it("accepts valid type names", () => {
  const validTypes = ["fire", "water", "grass", "electric", "normal"];

  validTypes.forEach(typeName => {
    expect(() => new PokemonType(typeName)).not.toThrow();
  });
});
