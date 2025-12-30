import { PokemonByName } from "../value-objects/PokemonByName.ts";
import { PokemonReference } from "../../../../shared/domain/value-objects";
import { PokemonType } from "../../../../shared/domain/value-objects/PokemonType";
export interface PokemonRepository {
  findAllByType(type: PokemonType): Promise<PokemonReference[]>;
  findDetailsByName(name: string): Promise<PokemonByName>;
}
