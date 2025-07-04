import { Pokemon } from "../entities/Pokemon.ts";
import { PokemonType } from "../value-objects/PokemonType.ts";

export interface PokemonRepository {
  findByType(type: PokemonType): Promise<Pokemon[]>;
}
