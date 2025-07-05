import { it, expect, vi, beforeEach } from "vitest";
import { url } from "../../../../../lib/constants";
import { HttpPokemonRepository } from "../HttpPokemonRepository";
import { Pokemon } from "../../../domain/entities/Pokemon";
import { PokemonType } from "../../../domain/value-objects/PokemonType";
import { mockApiResponse } from "./mocks";

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
  repo = new HttpPokemonRepository();
  // @ts-ignore
  repo.fetch = httpClientStub.get.bind(httpClientStub);
  // @ts-ignore
  global.fetch = vi.fn();
});

it("should return Pokemon[] mapped from API response", async () => {
  const type = new PokemonType("fire");

  // @ts-ignore
  global.fetch.mockResolvedValue({
    json: async () => mockApiResponse,
    status: 200,
    ok: true,
  });

  const [pokemon1, pokemon2] = await repo.findByType(type);

  expect(pokemon1).toBeInstanceOf(Pokemon);
  expect(pokemon1.name).toBe("charmander");
  expect(pokemon1.url).toBe(`${url.BASE}${url.POKEMON}4/`);
  expect(pokemon1.height).toBe(6);
  expect(pokemon1.imageUrl).toBe("sprite-url");

  expect(pokemon2).toBeInstanceOf(Pokemon);
  expect(pokemon2.name).toBe("vulpix");
  expect(pokemon2.url).toBe(`${url.BASE}${url.POKEMON}37/`);
  expect(pokemon2.height).toBe(6);
  expect(pokemon2.imageUrl).toBe("sprite-url2");
});

it("should call fetch with the correct URL", async () => {
  const type = new PokemonType("water");
  // @ts-ignore
  global.fetch.mockResolvedValue({
    json: async () => ({ pokemon: [] }),
    status: 200,
    ok: true,
  });

  await repo.findByType(type);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining(type.value)
  );
});
