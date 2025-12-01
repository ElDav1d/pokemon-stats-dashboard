export const bulbasaurDetailMock = {
  abilities: [
    {
      ability: {
        name: "overgrow",
        url: "https://pokeapi.co/api/v2/ability/65/",
      },
      is_hidden: false,
      slot: 1,
    },
    {
      ability: {
        name: "chlorophyll",
        url: "https://pokeapi.co/api/v2/ability/34/",
      },
      is_hidden: true,
      slot: 3,
    },
  ],
  base_experience: 64,
  cries: {
    latest:
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/1.ogg",
    legacy:
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/1.ogg",
  },
  forms: [
    {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon-form/1/",
    },
  ],
  game_indices: [
    {
      game_index: 1,
      version: {
        name: "red",
        url: "https://pokeapi.co/api/v2/version/1/",
      },
    },
  ],
  height: 7,
  held_items: [],
  id: 1,
  is_default: true,
  location_area_encounters: "https://pokeapi.co/api/v2/pokemon/1/encounters",
  moves: [],
  name: "bulbasaur",
  order: 1,
  past_abilities: [],
  past_types: [],
  species: {
    name: "bulbasaur",
    url: "https://pokeapi.co/api/v2/pokemon-species/1/",
  },
  sprites: {
    back_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/1.png",
    back_female: null,
    back_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/1.png",
    back_shiny_female: null,
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
    front_female: null,
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/1.png",
    front_shiny_female: null,
  },
  stats: [
    {
      base_stat: 45,
      effort: 0,
      stat: {
        name: "hp",
        url: "https://pokeapi.co/api/v2/stat/1/",
      },
    },
    {
      base_stat: 49,
      effort: 0,
      stat: {
        name: "attack",
        url: "https://pokeapi.co/api/v2/stat/2/",
      },
    },
    {
      base_stat: 49,
      effort: 0,
      stat: {
        name: "defense",
        url: "https://pokeapi.co/api/v2/stat/3/",
      },
    },
    {
      base_stat: 65,
      effort: 1,
      stat: {
        name: "special-attack",
        url: "https://pokeapi.co/api/v2/stat/4/",
      },
    },
    {
      base_stat: 65,
      effort: 0,
      stat: {
        name: "special-defense",
        url: "https://pokeapi.co/api/v2/stat/5/",
      },
    },
    {
      base_stat: 45,
      effort: 0,
      stat: {
        name: "speed",
        url: "https://pokeapi.co/api/v2/stat/6/",
      },
    },
  ],
  types: [
    {
      slot: 1,
      type: {
        name: "grass",
        url: "https://pokeapi.co/api/v2/type/12/",
      },
    },
    {
      slot: 2,
      type: {
        name: "poison",
        url: "https://pokeapi.co/api/v2/type/4/",
      },
    },
  ],
  weight: 69,
};

export const bulbasaurSpeciesMock = {
  base_happiness: 50,
  capture_rate: 45,
  color: {
    name: "green",
    url: "https://pokeapi.co/api/v2/pokemon-color/5/",
  },
  evolution_chain: {
    url: "https://pokeapi.co/api/v2/evolution-chain/1/",
  },
  evolves_from_species: null,
  flavor_text_entries: [],
  form_descriptions: [],
  forms_switchable: false,
  gender_rate: 1,
  genera: [],
  generation: {
    name: "generation-i",
    url: "https://pokeapi.co/api/v2/generation/1/",
  },
  growth_rate: {
    name: "medium-slow",
    url: "https://pokeapi.co/api/v2/growth-rate/4/",
  },
  habitat: {
    name: "grassland",
    url: "https://pokeapi.co/api/v2/pokemon-habitat/3/",
  },
  has_gender_differences: false,
  hatch_counter: 20,
  id: 1,
  is_baby: false,
  is_legendary: false,
  is_mythical: false,
  name: "bulbasaur",
  names: [],
  order: 1,
  pal_park_encounters: [],
  pokedex_numbers: [],
  shape: {
    name: "quadruped",
    url: "https://pokeapi.co/api/v2/pokemon-shape/8/",
  },
  varieties: [],
};

export const bulbasaurEvolutionChainMock = {
  baby_trigger_item: null,
  chain: {
    evolution_details: [],
    evolves_to: [
      {
        evolution_details: [
          {
            gender: null,
            held_item: null,
            item: null,
            known_move: null,
            known_move_type: null,
            location: null,
            min_affection: null,
            min_beauty: null,
            min_happiness: null,
            min_level: 16,
            needs_overworld_rain: false,
            party_species: null,
            party_type: null,
            relative_physical_stats: null,
            time_of_day: "",
            trade_species: null,
            trigger: {
              name: "level-up",
              url: "https://pokeapi.co/api/v2/evolution-trigger/1/",
            },
            turn_upside_down: false,
          },
        ],
        evolves_to: [
          {
            evolution_details: [
              {
                gender: null,
                held_item: null,
                item: null,
                known_move: null,
                known_move_type: null,
                location: null,
                min_affection: null,
                min_beauty: null,
                min_happiness: null,
                min_level: 32,
                needs_overworld_rain: false,
                party_species: null,
                party_type: null,
                relative_physical_stats: null,
                time_of_day: "",
                trade_species: null,
                trigger: {
                  name: "level-up",
                  url: "https://pokeapi.co/api/v2/evolution-trigger/1/",
                },
                turn_upside_down: false,
              },
            ],
            evolves_to: [],
            is_baby: false,
            species: {
              name: "venusaur",
              url: "https://pokeapi.co/api/v2/pokemon-species/3/",
            },
          },
        ],
        is_baby: false,
        species: {
          name: "ivysaur",
          url: "https://pokeapi.co/api/v2/pokemon-species/2/",
        },
      },
    ],
    is_baby: false,
    species: {
      name: "bulbasaur",
      url: "https://pokeapi.co/api/v2/pokemon-species/1/",
    },
  },
  id: 1,
};

export const grassTypeListMock = {
  pokemon: [
    {
      pokemon: {
        name: "bulbasaur",
        url: "https://pokeapi.co/api/v2/pokemon/1/",
      },
      slot: 1,
    },
    {
      pokemon: {
        name: "ivysaur",
        url: "https://pokeapi.co/api/v2/pokemon/2/",
      },
      slot: 1,
    },
    {
      pokemon: {
        name: "venusaur",
        url: "https://pokeapi.co/api/v2/pokemon/3/",
      },
      slot: 1,
    },
    {
      pokemon: {
        name: "oddish",
        url: "https://pokeapi.co/api/v2/pokemon/43/",
      },
      slot: 1,
    },
    {
      pokemon: {
        name: "gloom",
        url: "https://pokeapi.co/api/v2/pokemon/44/",
      },
      slot: 1,
    },
  ],
};

export const poisonTypeListMock = {
  pokemon: [
    {
      pokemon: {
        name: "bulbasaur",
        url: "https://pokeapi.co/api/v2/pokemon/1/",
      },
      slot: 2,
    },
    {
      pokemon: {
        name: "ivysaur",
        url: "https://pokeapi.co/api/v2/pokemon/2/",
      },
      slot: 2,
    },
    {
      pokemon: {
        name: "venusaur",
        url: "https://pokeapi.co/api/v2/pokemon/3/",
      },
      slot: 2,
    },
    {
      pokemon: {
        name: "weedle",
        url: "https://pokeapi.co/api/v2/pokemon/13/",
      },
      slot: 1,
    },
    {
      pokemon: {
        name: "kakuna",
        url: "https://pokeapi.co/api/v2/pokemon/14/",
      },
      slot: 1,
    },
  ],
};

export const ivysaurDetailMock = {
  abilities: [
    {
      ability: {
        name: "overgrow",
        url: "https://pokeapi.co/api/v2/ability/65/",
      },
      is_hidden: false,
      slot: 1,
    },
    {
      ability: {
        name: "chlorophyll",
        url: "https://pokeapi.co/api/v2/ability/34/",
      },
      is_hidden: true,
      slot: 3,
    },
  ],
  base_experience: 142,
  cries: {
    latest:
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/2.ogg",
    legacy:
      "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/legacy/2.ogg",
  },
  forms: [
    {
      name: "ivysaur",
      url: "https://pokeapi.co/api/v2/pokemon-form/2/",
    },
  ],
  game_indices: [
    {
      game_index: 2,
      version: {
        name: "red",
        url: "https://pokeapi.co/api/v2/version/1/",
      },
    },
  ],
  height: 10,
  held_items: [],
  id: 2,
  is_default: true,
  location_area_encounters: "https://pokeapi.co/api/v2/pokemon/2/encounters",
  moves: [],
  name: "ivysaur",
  order: 2,
  past_abilities: [],
  past_types: [],
  species: {
    name: "ivysaur",
    url: "https://pokeapi.co/api/v2/pokemon-species/2/",
  },
  sprites: {
    back_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/2.png",
    back_female: null,
    back_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/shiny/2.png",
    back_shiny_female: null,
    front_default:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png",
    front_female: null,
    front_shiny:
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/2.png",
    front_shiny_female: null,
  },
  stats: [
    {
      base_stat: 60,
      effort: 0,
      stat: {
        name: "hp",
        url: "https://pokeapi.co/api/v2/stat/1/",
      },
    },
    {
      base_stat: 62,
      effort: 0,
      stat: {
        name: "attack",
        url: "https://pokeapi.co/api/v2/stat/2/",
      },
    },
    {
      base_stat: 63,
      effort: 0,
      stat: {
        name: "defense",
        url: "https://pokeapi.co/api/v2/stat/3/",
      },
    },
    {
      base_stat: 80,
      effort: 1,
      stat: {
        name: "special-attack",
        url: "https://pokeapi.co/api/v2/stat/4/",
      },
    },
    {
      base_stat: 80,
      effort: 1,
      stat: {
        name: "special-defense",
        url: "https://pokeapi.co/api/v2/stat/5/",
      },
    },
    {
      base_stat: 60,
      effort: 0,
      stat: {
        name: "speed",
        url: "https://pokeapi.co/api/v2/stat/6/",
      },
    },
  ],
  types: [
    {
      slot: 1,
      type: {
        name: "grass",
        url: "https://pokeapi.co/api/v2/type/12/",
      },
    },
    {
      slot: 2,
      type: {
        name: "poison",
        url: "https://pokeapi.co/api/v2/type/4/",
      },
    },
  ],
  weight: 130,
};

export const ivysaurSpeciesMock = {
  base_happiness: 50,
  capture_rate: 45,
  color: {
    name: "green",
    url: "https://pokeapi.co/api/v2/pokemon-color/5/",
  },
  evolution_chain: {
    url: "https://pokeapi.co/api/v2/evolution-chain/1/",
  },
  evolves_from_species: {
    name: "bulbasaur",
    url: "https://pokeapi.co/api/v2/pokemon-species/1/",
  },
  flavor_text_entries: [],
  form_descriptions: [],
  forms_switchable: false,
  gender_rate: 1,
  genera: [],
  generation: {
    name: "generation-i",
    url: "https://pokeapi.co/api/v2/generation/1/",
  },
  growth_rate: {
    name: "medium-slow",
    url: "https://pokeapi.co/api/v2/growth-rate/4/",
  },
  habitat: {
    name: "grassland",
    url: "https://pokeapi.co/api/v2/pokemon-habitat/3/",
  },
  has_gender_differences: false,
  hatch_counter: 20,
  id: 2,
  is_baby: false,
  is_legendary: false,
  is_mythical: false,
  name: "ivysaur",
  names: [],
  order: 2,
  pal_park_encounters: [],
  pokedex_numbers: [],
  shape: {
    name: "quadruped",
    url: "https://pokeapi.co/api/v2/pokemon-shape/8/",
  },
  varieties: [],
};
