import { it, expect, vi } from "vitest";
import { GetPokemonListUseCase } from "../GetPokemonListUseCase";
import { PokemonRepository } from "../../../../domain/ports/PokemonRepository";
import { PokemonType } from "../../../../domain/value-objects/PokemonType";
import { PokemonByType } from "../../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../../domain/value-objects/PokemonByName";

it("calls repository.findByType with the correct type and returns the result", async () => {
  const fakeType = new PokemonType("fire");

  const fakePokemons = [
    new PokemonByType("charmander", "url1"),
    new PokemonByType("vulpix", "url2"),
  ];

  const fakeDetails = [
    new PokemonByName(5, "imgUrl1"),
    new PokemonByName(6, "imgUrl2"),
  ];

  const repoMock: PokemonRepository = {
    findAllByType: vi.fn().mockResolvedValue(fakePokemons),
    findDetailsByName: vi
      .fn()
      .mockResolvedValueOnce(fakeDetails[0])
      .mockResolvedValueOnce(fakeDetails[1]),
  };

  const useCase = new GetPokemonListUseCase(repoMock);

  const result = await useCase.execute(fakeType);

  expect(repoMock.findAllByType).toHaveBeenCalledWith(fakeType);
  expect(result).toEqual(fakePokemons);
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
