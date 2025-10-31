import { PokemonTypeItem } from "../entities/PokemonTypeItem";

export interface PokemonTypesRepository {
  findAll(): Promise<PokemonTypeItem[]>;
}
