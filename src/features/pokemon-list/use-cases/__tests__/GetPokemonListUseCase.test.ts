import { it, expect, vi } from "vitest";
import { GetPokemonListUseCase } from "../GetPokemonListUseCase";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { Pokemon } from "../../domain/entities/Pokemon";

it("calls repository.findByType with the correct type and returns the result", async () => {
  const fakeType = new PokemonType("fire");

  const fakePokemons = [
    new Pokemon("charmander", "url1", 6, "img1"),
    new Pokemon("vulpix", "url2", 6, "img2"),
  ];

  const repositoryMock: PokemonRepository = {
    findByType: vi.fn().mockResolvedValue(fakePokemons),
  };

  const useCase = new GetPokemonListUseCase(repositoryMock);

  const result = await useCase.execute(fakeType);

  expect(repositoryMock.findByType).toHaveBeenCalledWith(fakeType);
  expect(result).toEqual(fakePokemons);
});

it("propagates errors from the repository", async () => {
  const fakeType = new PokemonType("water");
  const error = new Error("Repository error");
  const repositoryMock: PokemonRepository = {
    findByType: vi.fn().mockRejectedValue(error),
  };

  const useCase = new GetPokemonListUseCase(repositoryMock);

  await expect(useCase.execute(fakeType)).rejects.toThrow("Repository error");
  expect(repositoryMock.findByType).toHaveBeenCalledWith(fakeType);
});
