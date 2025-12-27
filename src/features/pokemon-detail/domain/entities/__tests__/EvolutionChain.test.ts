import { it, expect } from "vitest";
import { EvolutionChain } from "../EvolutionChain";

it("returns all evolutions excluding current pokemon", () => {
  const chain = new EvolutionChain(["bulbasaur", "ivysaur", "venusaur"]);
  const result = chain.getEvolutionsExcluding("bulbasaur");
  expect(result).toEqual(["ivysaur", "venusaur"]);
});

it("returns empty array when current pokemon is the only one", () => {
  const chain = new EvolutionChain(["ditto"]);
  const result = chain.getEvolutionsExcluding("ditto");
  expect(result).toEqual([]);
});

it("returns all pokemons when current name is not in chain", () => {
  const chain = new EvolutionChain(["bulbasaur", "ivysaur", "venusaur"]);
  const result = chain.getEvolutionsExcluding("pikachu");
  expect(result).toEqual(["bulbasaur", "ivysaur", "venusaur"]);
});
