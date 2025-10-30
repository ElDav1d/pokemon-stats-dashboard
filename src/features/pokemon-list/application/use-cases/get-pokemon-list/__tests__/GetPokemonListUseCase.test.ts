import { it, expect } from "vitest";
import { GetPokemonListUseCase } from "../GetPokemonListUseCase";
import { PokemonType } from "../../../../domain/value-objects/PokemonType";
import { PokemonListItem } from "../../../../domain/entities/PokemonListItem";
import {
  mockPokemonByTypeCharmander,
  mockPokemonByTypeVulpixForGetUseCase,
  mockPokemonByNameCharmanderForGetUseCase,
  mockPokemonByNameVulpixForGetUseCase,
  createMockPokemonRepository,
  createMockPokemonRepositoryWithError,
} from "../../../../__tests__/mocks";

it("returns a list of Pokemon items with the required values", async () => {
  const fakeType = new PokemonType("fire");

  const fakePokemons = [
    mockPokemonByTypeCharmander,
    mockPokemonByTypeVulpixForGetUseCase,
  ];

  const fakeDetails = [
    mockPokemonByNameCharmanderForGetUseCase,
    mockPokemonByNameVulpixForGetUseCase,
  ];

  const repoMock = createMockPokemonRepository(fakePokemons, fakeDetails);

  const expectedPokemons = fakePokemons.map((pokemon, index) => {
    return new PokemonListItem(
      `test-id-${index}`,
      pokemon.name,
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
  });
});

it("propagates errors from the repository", async () => {
  const fakeType = new PokemonType("water");
  const error = new Error("Repository error");

  const repoMock = createMockPokemonRepositoryWithError(error);

  const useCase = new GetPokemonListUseCase(repoMock);

  await expect(useCase.execute(fakeType)).rejects.toThrow("Repository error");
  expect(repoMock.findAllByType).toHaveBeenCalledWith(fakeType);
});
