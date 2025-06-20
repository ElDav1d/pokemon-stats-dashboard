export type PokemonItem = {
  name: string;
  url: string;
};

export interface IPokemonListItem {
  pokemon: PokemonItem;
  slot: number;
}
