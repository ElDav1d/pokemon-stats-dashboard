import { PokemonDetail } from "../entities/PokemonDetail";
import { EvolutionChain } from "../entities/EvolutionChain";
import { PokemonReference } from "../../../../shared/domain/value-objects";

export interface PokemonDetailRepository {
  /**
   * Gets pokemon details by name
   */
  findByName(name: string): Promise<PokemonDetail>;

  /**
   * Gets the evolution chain URL from the species URL
   */
  findEvolutionChainUrl(speciesUrl: string): Promise<string>;

  /**
   * Gets the evolution chain from its URL
   */
  findEvolutionChain(evolutionChainUrl: string): Promise<EvolutionChain>;

  /**
   * Gets all pokemon of a specific type
   */
  findAllByType(typeName: string): Promise<PokemonReference[]>;
}
