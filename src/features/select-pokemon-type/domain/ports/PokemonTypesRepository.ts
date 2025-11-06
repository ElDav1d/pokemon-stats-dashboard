import { PokemonTypeItem } from "../value-objects/PokemonTypeItem";

export interface PokemonTypesRepository {
  findAll(): Promise<PokemonTypeItem[]>;
}
