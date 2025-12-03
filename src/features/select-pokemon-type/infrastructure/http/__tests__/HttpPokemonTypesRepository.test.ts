import { it, expect, vi, beforeEach } from "vitest";
import { HttpPokemonTypesRepository } from "../HttpPokemonTypesRepository";
import { PokemonType } from "../../../../../shared/domain/value-objects/PokemonType";

beforeEach(() => {
  // @ts-ignore
  globalThis.fetch = vi.fn();
});

it("should return a list of pokemon types", async () => {
  const mockResponse = {
    results: [{ name: "normal" }, { name: "fighting" }, { name: "flying" }],
  };

  (globalThis.fetch as any).mockResolvedValue({
    json: async () => mockResponse,
    status: 200,
    ok: true,
  });

  const repo = new HttpPokemonTypesRepository("https://pokeapi.co/api/v2/");
  const types = await repo.findAll();

  expect(types).toHaveLength(3);
  expect(types[0]).toBeInstanceOf(PokemonType);
  expect(types[0].value).toBe("normal");
  expect(types[1].value).toBe("fighting");
  expect(types[2].value).toBe("flying");
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
