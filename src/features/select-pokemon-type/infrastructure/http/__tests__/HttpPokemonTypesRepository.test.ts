import { it, expect, vi, beforeEach } from "vitest";
import { HttpPokemonTypesRepository } from "../HttpPokemonTypesRepository";
import { PokemonTypeItem } from "../../../domain/entities/PokemonTypeItem";

beforeEach(() => {
  // @ts-ignore
  globalThis.fetch = vi.fn();
});

it("should return a list of pokemon types", async () => {
  const mockResponse = {
    results: [
      { name: "normal", url: "https://pokeapi.co/api/v2/type/1/" },
      { name: "fighting", url: "https://pokeapi.co/api/v2/type/2/" },
      { name: "flying", url: "https://pokeapi.co/api/v2/type/3/" },
    ],
  };

  (globalThis.fetch as any).mockResolvedValue({
    json: async () => mockResponse,
    status: 200,
    ok: true,
  });

  const repo = new HttpPokemonTypesRepository("https://pokeapi.co/api/v2/");
  const types = await repo.findAll();

  expect(types).toHaveLength(3);
  expect(types[0]).toBeInstanceOf(PokemonTypeItem);
  expect(types[0].name).toBe("normal");
  expect(types[0].url).toBe("https://pokeapi.co/api/v2/type/1/");
  expect(types[1].name).toBe("fighting");
  expect(types[2].name).toBe("flying");
});

it("should call fetch with the correct URL", async () => {
  const mockResponse = { results: [] };

  (globalThis.fetch as any).mockResolvedValue({
    json: async () => mockResponse,
    status: 200,
    ok: true,
  });

  const repo = new HttpPokemonTypesRepository("https://pokeapi.co/api/v2/");
  await repo.findAll();

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pokeapi.co/api/v2/type"
  );
});

it("should throw an error when fetch fails", async () => {
  (globalThis.fetch as any).mockResolvedValue({
    ok: false,
    status: 500,
  });

  const repo = new HttpPokemonTypesRepository("https://pokeapi.co/api/v2/");

  await expect(repo.findAll()).rejects.toThrow("Failed to fetch pokemon types");
});
