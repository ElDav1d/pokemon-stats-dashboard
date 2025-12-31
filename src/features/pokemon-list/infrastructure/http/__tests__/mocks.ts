import {
  RawPokemonItem,
  RawPokemonTypeResponse,
} from "../dto/PokemonDTO";

export const mockApiResponse = {
  pokemon: [
    {
      name: "charmander",
      url: "https://pokeapi.co/api/v2/pokemon/4/",
      height: 6,
      sprites: { front_default: "sprite-url" },
    },
    {
      name: "vulpix",
      url: "https://pokeapi.co/api/v2/pokemon/37/",
      height: 10,
      sprites: { front_default: "sprite-url2" },
    },
  ],
};

export const pokemonByTypeResponseMock: RawPokemonTypeResponse = {
  damage_relations: {
    double_damage_from: [],
    double_damage_to: [],
    half_damage_from: [],
    half_damage_to: [],
    no_damage_from: [],
    no_damage_to: [],
  },
  game_indices: [],
  generation: { name: "", url: "" },
  id: 4,
  move_damage_class: {
    name: "",
    url: "",
  },
  moves: [],
  name: "",
  names: [],
  past_damage_relations: [],
  pokemon: [
    {
      pokemon: {
        name: "charmander",
        url: "https://pokeapi.co/api/v2/pokemon/4/",
      },
      slot: 1,
    },
    {
      pokemon: {
        name: "vulpix",
        url: "https://pokeapi.co/api/v2/pokemon/37/",
      },
      slot: 1,
    },
  ],
  sprites: {},
};

export const pokemonByNameResponseMock: RawPokemonItem = {
  abilities: [],
  base_experience: 0,
  cries: {
    latest: "",
    legacy: "",
  },
  forms: [],
  game_indices: [],
  height: 6,
  held_items: [],
  id: 4,
  is_default: true,
  location_area_encounters: "",
  moves: [],
  name: "charmander",
  order: 0,
  past_abilities: [],
  past_types: [],
  species: { name: "", url: "" },
  sprites: {
    back_default: "",
    back_female: "",
    back_shiny: "",
    back_shiny_female: "",
    front_default: "sprite-url",
    front_female: "",
    front_shiny: "",
    front_shiny_female: "",
  },
  stats: [],
  types: [],
  weight: 85,
};
