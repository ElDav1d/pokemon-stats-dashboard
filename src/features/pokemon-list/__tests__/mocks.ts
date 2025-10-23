import { PokemonByType } from "../domain/value-objects/PokemonByType";
import { PokemonByName } from "../domain/value-objects/PokemonByName";
import { PokemonListItem } from "../domain/entities/PokemonListItem";

// Mock PokemonByType instances for PokemonListViewModel tests
export const mockPokemonByTypeCharizard = new PokemonByType(
  "charizard",
  "https://pokeapi.co/api/v2/pokemon/6/"
);

export const mockPokemonByTypeVulpix = new PokemonByType(
  "vulpix",
  "https://pokeapi.co/api/v2/pokemon/37/"
);

// Mock PokemonByName instances for PokemonListViewModel tests
export const mockPokemonByNameCharizard = new PokemonByName(
  "charizard",
  17,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
);

export const mockPokemonByNameVulpix = new PokemonByName(
  "vulpix",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
);

export const mockPokemonByNameCharmander = new PokemonByName(
  "charmander",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
);

// Mock PokemonListItem instances for sort tests (PokemonListViewModel)
export const mockPokemonListItemCharizard = new PokemonListItem(
  "1",
  "charizard",
  "https://pokeapi.co/api/v2/pokemon/6/",
  20,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
);

export const mockPokemonListItemVulpix = new PokemonListItem(
  "2",
  "vulpix",
  "https://pokeapi.co/api/v2/pokemon/37/",
  6,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/37.png"
);

export const mockPokemonListItemCharmander = new PokemonListItem(
  "3",
  "charmander",
  "https://pokeapi.co/api/v2/pokemon/4/",
  5,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
);

// Mock PokemonListItem instances for SortPokemonsByHeightUseCase tests
export const mockPokemonListItemBulbasaur = new PokemonListItem(
  "1",
  "bulbasaur",
  "https://pokeapi.co/api/v2/pokemon/1/",
  7,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
);

export const mockPokemonListItemIvysaur = new PokemonListItem(
  "2",
  "ivysaur",
  "https://pokeapi.co/api/v2/pokemon/2/",
  20,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png"
);

export const mockPokemonListItemVenusaur = new PokemonListItem(
  "3",
  "venusaur",
  "https://pokeapi.co/api/v2/pokemon/3/",
  12,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png"
);
