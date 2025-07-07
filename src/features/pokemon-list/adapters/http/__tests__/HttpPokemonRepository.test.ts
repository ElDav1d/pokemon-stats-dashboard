import { it, expect, vi, beforeEach } from "vitest";
import { url } from "../../../../../lib/constants";
import { HttpPokemonRepository } from "../HttpPokemonRepository";
import { PokemonType } from "../../../domain/value-objects/PokemonType";
import { pokemonByNameResponseMock, pokemonByTypeResponseMock } from "./mocks";
import { FetchHttpClient } from "../../../../../infraestructure/http/FetchHttpClient";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";

class HttpClientStub {
  public getMock = vi.fn();

  async get<T>(url: string): Promise<T> {
    return this.getMock(url);
  }
}

declare const global: any;

let httpClientStub: HttpClientStub;
let repo: HttpPokemonRepository;

beforeEach(() => {
  httpClientStub = new HttpClientStub();
  // Patch the repository to use the stub instead of fetch
  const httpClient = new FetchHttpClient(url.BASE);
  repo = new HttpPokemonRepository(httpClient);
  // @ts-ignore
  repo.fetch = httpClientStub.get.bind(httpClientStub);
  // @ts-ignore
  global.fetch = vi.fn();
});

it("should return a list of pokemons by type", async () => {
  const type = new PokemonType("fire");

  // @ts-ignore
  global.fetch.mockResolvedValue({
    json: async () => pokemonByTypeResponseMock,
    status: 200,
    ok: true,
  });

  const [pokemon1, pokemon2] = await repo.findAllByType(type);

  console.log(pokemon1, pokemon2);

  expect(pokemon1).toBeInstanceOf(PokemonByType);
  expect(pokemon1.name).toBe("charmander");
  expect(pokemon1.url).toBe(`${url.BASE}${url.POKEMON}4/`);

  expect(pokemon2).toBeInstanceOf(PokemonByType);
  expect(pokemon2.name).toBe("vulpix");
  expect(pokemon2.url).toBe(`${url.BASE}${url.POKEMON}37/`);
});

it("should return the details of a pokemon by name", async () => {
  const pokemonName = "charmander";

  global.fetch.mockResolvedValue({
    json: async () => pokemonByNameResponseMock,
    status: 200,
    ok: true,
  });

  const pokemonDetails = await repo.findDetailsByName(pokemonName);

  expect(pokemonDetails).toBeInstanceOf(PokemonByName);
  expect(pokemonDetails?.height).toBe(6);
  expect(pokemonDetails?.imageUrl).toBe("sprite-url");
});

it("should call fetch with the correct URL", async () => {
  const type = new PokemonType("water");
  // @ts-ignore
  global.fetch.mockResolvedValue({
    json: async () => ({ pokemon: [] }),
    status: 200,
    ok: true,
  });

  await repo.findAllByType(type);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining(type.value)
  );
});
