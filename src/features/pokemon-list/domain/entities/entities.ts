// TODO: clean up the code and remove any unused imports or variables

import { IPokemonDetail } from "../../../../pages/Detail/entities";

export type PokemonItem = {
  name: string;
  url: string;
};

export interface IPokemonListItem {
  pokemon: PokemonItem;
  slot: number;
}

export interface IPokemonListItemWithDetails extends IPokemonListItem {
  details: IPokemonDetail;
}
