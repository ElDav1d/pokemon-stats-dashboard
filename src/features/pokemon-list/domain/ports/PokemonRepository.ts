import { PokemonByName } from "../value-objects/PokemonByName.ts";
import { PokemonByType } from "../value-objects/PokemonByType.ts";
import { PokemonType } from "../../../../shared/domain/value-objects/PokemonType";
export interface PokemonRepository {
  findAllByType(type: PokemonType): Promise<PokemonByType[]>;
  findDetailsByName(name: string): Promise<PokemonByName>;
}
