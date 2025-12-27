import {
  PokemonDetailResponse,
  EvolutionChainResponse,
  SpeciesResponse,
} from "../dto";

export const pokemonDetailResponseMock: PokemonDetailResponse = {
  id: 1,
  name: "bulbasaur",
  height: 7,
  weight: 69,
  sprites: { front_default: "https://sprite.png" },
  stats: [
    { base_stat: 45, effort: 0, stat: { name: "hp" } },
    { base_stat: 49, effort: 0, stat: { name: "attack" } },
  ],
  types: [
    { slot: 1, type: { name: "grass" } },
    { slot: 2, type: { name: "poison" } },
  ],
  species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
};

export const speciesResponseMock: SpeciesResponse = {
  evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/1/" },
};

export const evolutionChainResponseMock: EvolutionChainResponse = {
  chain: {
    species: { name: "bulbasaur", url: "" },
    evolves_to: [
      {
        species: { name: "ivysaur", url: "" },
        evolves_to: [
          {
            species: { name: "venusaur", url: "" },
            evolves_to: [],
          },
        ],
      },
    ],
  },
};

export const evolutionChainNoEvolutionsResponseMock: EvolutionChainResponse = {
  chain: {
    species: { name: "ditto", url: "" },
    evolves_to: [],
  },
};
