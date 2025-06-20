import { PokemonDetail } from "../../shared/entities";

export type PokemonItem = {
  name: string;
  url: string;
};

export interface IPokemonListItem {
  pokemon: PokemonItem;
  slot: number;
}

export interface IPokemonListItemWithDetails extends IPokemonListItem {
  details: PokemonDetail;
}
