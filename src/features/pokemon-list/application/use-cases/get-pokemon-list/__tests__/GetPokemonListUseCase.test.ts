import { it, expect, vi } from "vitest";
import { GetPokemonListUseCase } from "../GetPokemonListUseCase";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonType } from "../../../../domain/value-objects/PokemonType";
import { PokemonByType } from "../../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";
import { PokemonListItem } from "../../../../domain/entities/PokemonListItem";

it("returns a list of Pokemon items with the required values", async () => {
  const fakeType = new PokemonType("fire");

  const fakePokemons = [
    new PokemonByType("charmander", "url1"),
    new PokemonByType("vulpix", "url2"),
  ];

  const fakeDetails = [
    new PokemonByName("charmander", 5, "imgUrl1"),
    new PokemonByName("vulpix", 6, "imgUrl2"),
  ];

  const repoMock: PokemonRepository = {
    findAllByType: vi.fn().mockResolvedValue(fakePokemons),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(fakeDetails[0])
      .mockResolvedValueOnce(fakeDetails[1]),
  };

  const expectedPokemons = fakePokemons.map((pokemon, index) => {
    return new PokemonListItem(
      `test-id-${index}`,
      pokemon.name,
      pokemon.url,
      fakeDetails[index].height,
      fakeDetails[index].imageUrl
    );
  });

  const useCase = new GetPokemonListUseCase(repoMock);

  const result = await useCase.execute(fakeType);

  result.forEach((item, index) => {
    expect(item.id).toBeDefined();
    expect(item.name).toEqual(expectedPokemons[index].name);
    expect(item.imageUrl).toEqual(expectedPokemons[index].imageUrl);
    expect(item.height).toEqual(expectedPokemons[index].height);
    expect(item.url).toEqual(expectedPokemons[index].url);
  });
});

it("propagates errors from the repository", async () => {
  const fakeType = new PokemonType("water");
  const error = new Error("Repository error");

  const repoMock: PokemonRepository = {
    findAllByType: vi.fn().mockRejectedValue(error),
    findDetailsByName: vi.fn(),
  };

  const useCase = new GetPokemonListUseCase(repoMock);

  await expect(useCase.execute(fakeType)).rejects.toThrow("Repository error");
  expect(repoMock.findAllByType).toHaveBeenCalledWith(fakeType);
});
