import { PokemonType } from "../../../../shared/domain/value-objects/PokemonType";

export interface PokemonTypesRepository {
  findAll(): Promise<PokemonType[]>;
}
