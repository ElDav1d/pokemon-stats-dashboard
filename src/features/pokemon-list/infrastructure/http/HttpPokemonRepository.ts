import { PokemonReference } from "../../../../shared/domain/value-objects";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../../../shared/domain/value-objects/PokemonType";
import { HttpClient } from "../../../../shared/infrastructure/client/http/HttpClient";
import {
  RawPokemonReference,
  RawPokemonTypeResponse,
  RawPokemonListItem,
} from "./dto/PokemonDTO";
import { PokemonByName } from "../../domain/value-objects/PokemonByName";

/**
 * Configuration for HttpPokemonRepository
 */
export interface HttpPokemonRepositoryConfig {
  typeEndpoint: string;
  pokemonEndpoint: string;
}

export class HttpPokemonRepository implements PokemonRepository {
  constructor(
    private readonly http: HttpClient,
    private readonly config: HttpPokemonRepositoryConfig
  ) {}

  async findAllByType(type: PokemonType): Promise<PokemonReference[]> {
    const data = await this.http.get<RawPokemonTypeResponse>(
      `${this.config.typeEndpoint}${type.value}`
    );

    return data.pokemon.map(
      (rawItem: RawPokemonReference) => new PokemonReference(rawItem.pokemon.name)
    );
  }

  async findDetailsByName(name: string): Promise<PokemonByName> {
    const data = await this.http.get<RawPokemonListItem>(
      `${this.config.pokemonEndpoint}${name}`
    );

    return new PokemonByName(
      data.name,
      data.height,
      data.sprites.front_default
    );
  }
}
