export interface PokemonByTypeResponse {
  pokemon: PokemonSlot[];
}

export interface PokemonSlot {
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}
