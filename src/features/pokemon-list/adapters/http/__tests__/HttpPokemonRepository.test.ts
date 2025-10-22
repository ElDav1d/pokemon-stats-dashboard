import { it, expect, vi, beforeEach } from "vitest";
import { HttpPokemonRepository } from "../HttpPokemonRepository";
import { PokemonType } from "../../../domain/value-objects/PokemonType";
import { pokemonByNameResponseMock, pokemonByTypeResponseMock } from "./mocks";
import { FetchHttpClient } from "../../../../../infrastructure/client/fetch/FetchHttpClient";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";

class HttpClientStub {
  public getMock = vi.fn();

  async get<T>(url: string): Promise<T> {
    return this.getMock(url);
  }
}

let httpClientStub: HttpClientStub;
let repo: HttpPokemonRepository;

beforeEach(() => {
  httpClientStub = new HttpClientStub();
  // Patch the repository to use the stub instead of fetch
  const httpClient = new FetchHttpClient("https://pokeapi.co/api/v2/");
  repo = new HttpPokemonRepository(httpClient);
  // @ts-ignore
  repo.fetch = httpClientStub.get.bind(httpClientStub);
  // @ts-ignore
  globalThis.fetch = vi.fn();
});

it("should return a list of pokemons by type", async () => {
  const type = new PokemonType("fire");

  // @ts-ignore
  globalThis.fetch.mockResolvedValue({
    json: async () => pokemonByTypeResponseMock,
    status: 200,
    ok: true,
  });

  const [pokemon1, pokemon2] = await repo.findAllByType(type);

  expect(pokemon1).toBeInstanceOf(PokemonByType);
  expect(pokemon1.name).toBe("charmander");
  expect(pokemon1.url).toBe("https://pokeapi.co/api/v2/pokemon/4/");

  expect(pokemon2).toBeInstanceOf(PokemonByType);
  expect(pokemon2.name).toBe("vulpix");
  expect(pokemon2.url).toBe("https://pokeapi.co/api/v2/pokemon/37/");
});

it("should return the details of a pokemon by name", async () => {
  const pokemonName = "charmander";

  (globalThis.fetch as any).mockResolvedValue({
    json: async () => pokemonByNameResponseMock,
    status: 200,
    ok: true,
  });

  const pokemonDetails = await repo.findDetailsByName(pokemonName);

  expect(pokemonDetails).toBeInstanceOf(PokemonByName);
  expect(pokemonDetails?.name).toBe("charmander");
  expect(pokemonDetails?.height).toBe(6);
  expect(pokemonDetails?.imageUrl).toBe("sprite-url");
});

it("should call fetch with the correct URL", async () => {
  const type = new PokemonType("water");
  // @ts-ignore
  globalThis.fetch.mockResolvedValue({
    json: async () => ({ pokemon: [] }),
    status: 200,
    ok: true,
  });

  await repo.findAllByType(type);

  // Verify URL is built correctly without duplication
  const expectedUrl = "https://pokeapi.co/api/v2/type/water";
  expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl);

  // Ensure no duplication of base URL
  const actualUrl = (globalThis.fetch as any).mock.calls[0][0];
  const baseUrlCount = (actualUrl.match(/https:\/\/pokeapi\.co\/api\/v2/g) || []).length;
  expect(baseUrlCount).toBe(1);
});

it("should call fetch with correct URL for pokemon details", async () => {
  const pokemonName = "charmander";
  // @ts-ignore
  globalThis.fetch.mockResolvedValue({
    json: async () => pokemonByNameResponseMock,
    status: 200,
    ok: true,
  });

  await repo.findDetailsByName(pokemonName);

  // Verify URL is built correctly without duplication
  const expectedUrl = "https://pokeapi.co/api/v2/pokemon/charmander";
  expect(globalThis.fetch).toHaveBeenCalledWith(expectedUrl);

  // Ensure no duplication of base URL
  const actualUrl = (globalThis.fetch as any).mock.calls[0][0];
  const baseUrlCount = (actualUrl.match(/https:\/\/pokeapi\.co\/api\/v2/g) || []).length;
  expect(baseUrlCount).toBe(1);
});
