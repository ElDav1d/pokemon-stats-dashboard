import { it, expect, vi, beforeEach } from "vitest";
import { HttpPokemonDetailRepository } from "../HttpPokemonDetailRepository";
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";

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
    json: async () => ({
      id: 1,
      name: "bulbasaur",
      height: 7,
      weight: 69,
      sprites: { front_default: "https://sprite.png" },
      stats: [
        { base_stat: 45, effort: 0, stat: { name: "hp" } },
        { base_stat: 49, effort: 0, stat: { name: "attack" } },
      ],
      types: [
        { slot: 1, type: { name: "grass" } },
        { slot: 2, type: { name: "poison" } },
      ],
      species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
    }),
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
    json: async () => ({
      evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/1/" },
    }),
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
    json: async () => ({
      chain: {
        species: { name: "bulbasaur", url: "" },
        evolves_to: [
          {
            species: { name: "ivysaur", url: "" },
            evolves_to: [
              {
                species: { name: "venusaur", url: "" },
                evolves_to: [],
              },
            ],
          },
        ],
      },
    }),
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
    json: async () => ({
      chain: {
        species: { name: "ditto", url: "" },
        evolves_to: [],
      },
    }),
  });

  const result = await repository.findEvolutionChain(
    "https://pokeapi.co/api/v2/evolution-chain/66/"
  );

  expect(result.pokemonNames).toEqual(["ditto"]);
});
