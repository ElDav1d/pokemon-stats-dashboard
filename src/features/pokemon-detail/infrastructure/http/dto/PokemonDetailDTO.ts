export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  stats: StatResponse[];
  types: TypeResponse[];
  species: {
    name: string;
    url: string;
  };
}

export interface StatResponse {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
  };
}

export interface TypeResponse {
  slot: number;
  type: {
    name: string;
  };
}
