import { it, expect, vi } from "vitest";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";
import { PokemonType } from "../../../domain/value-objects/PokemonType";
import { PokemonListViewModel } from "../PokemonListViewModel";

it("should load pokemon list by type", async () => {
  const mockPokemonByType1 = new PokemonByType(
    "charizard",
    "https://pokeapi.co/api/v2/pokemon/6/"
  );
  const mockPokemonByType2 = new PokemonByType(
    "vulpix",
    "https://pokeapi.co/api/v2/pokemon/37/"
  );

  const mockPokemonByName1 = new PokemonByName(
    "charizard",
    17,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
  );
  const mockPokemonByName2 = new PokemonByName(
    "vulpix",
    6,
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
  );

  const mockRepository: PokemonRepository = {
    findAllByType: vi.fn().mockResolvedValue([mockPokemonByType1, mockPokemonByType2]),
    findDetailsByName: vi.fn()
      .mockResolvedValueOnce(mockPokemonByName1)
      .mockResolvedValueOnce(mockPokemonByName2),
  };

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = await viewModel.loadPokemonList("fire");

  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("charizard");
  expect(result[1].name).toBe("vulpix");
  expect(mockRepository.findAllByType).toHaveBeenCalledWith(
    new PokemonType("fire")
  );
});

it("should return empty array when type is empty", async () => {
  const mockRepository: PokemonRepository = {
    findAllByType: vi.fn(),
    findDetailsByName: vi.fn(),
  };

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = await viewModel.loadPokemonList("");

  expect(result).toEqual([]);
  expect(mockRepository.findAllByType).not.toHaveBeenCalled();
});

it("should sort pokemon list by height", () => {
  const mockRepository: PokemonRepository = {
    findAllByType: vi.fn(),
    findDetailsByName: vi.fn(),
  };

  const unsortedList = [
    new PokemonListItem(
      "1",
      "charizard",
      "https://pokeapi.co/api/v2/pokemon/6/",
      20,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
    ),
    new PokemonListItem(
      "2",
      "vulpix",
      "https://pokeapi.co/api/v2/pokemon/37/",
      6,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
    ),
    new PokemonListItem(
      "3",
      "charmander",
      "https://pokeapi.co/api/v2/pokemon/4/",
      5,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
    ),
  ];

  const viewModel = new PokemonListViewModel(mockRepository);

  const result = viewModel.sortPokemonListByHeight(unsortedList);

  expect(result[0].height).toBe(5);
  expect(result[1].height).toBe(6);
  expect(result[2].height).toBe(20);
});
