import { it, expect, vi, beforeEach } from "vitest";
import { HttpPokemonDetailRepository } from "../HttpPokemonDetailRepository";
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";
import {
  pokemonDetailResponseMock,
  speciesResponseMock,
  evolutionChainResponseMock,
  evolutionChainNoEvolutionsResponseMock,
} from "./mocks";

let mockFetch: ReturnType<typeof vi.fn>;
let repository: HttpPokemonDetailRepository;

beforeEach(() => {
  mockFetch = vi.fn();
  globalThis.fetch = mockFetch;
  repository = new HttpPokemonDetailRepository("https://pokeapi.co/api/v2/", {
    pokemonEndpoint: "pokemon/",
    typeEndpoint: "type/",
  });
});

it("finds pokemon detail by name and maps to domain entity", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => pokemonDetailResponseMock,
  });

  const result = await repository.findByName("bulbasaur");

  expect(result).toBeInstanceOf(PokemonDetail);
  expect(result.name).toBe("bulbasaur");
  expect(result.height).toBe(7);
  expect(result.stats).toHaveLength(2);
  expect(result.types).toEqual(["grass", "poison"]);
  expect(mockFetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/bulbasaur");
});

it("finds evolution chain URL from species URL", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => speciesResponseMock,
  });

  const result = await repository.findEvolutionChainUrl(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );

  expect(result).toBe("https://pokeapi.co/api/v2/evolution-chain/1/");
  expect(mockFetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon-species/1/");
});

it("finds evolution chain and returns domain entity with all pokemon names", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => evolutionChainResponseMock,
  });

  const result = await repository.findEvolutionChain(
    "https://pokeapi.co/api/v2/evolution-chain/1/"
  );

  expect(result).toBeInstanceOf(EvolutionChain);
  expect(result.pokemonNames).toEqual(["bulbasaur", "ivysaur", "venusaur"]);
});

it("handles pokemon with no evolutions", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => evolutionChainNoEvolutionsResponseMock,
  });

  const result = await repository.findEvolutionChain(
    "https://pokeapi.co/api/v2/evolution-chain/66/"
  );

  expect(result.pokemonNames).toEqual(["ditto"]);
});
