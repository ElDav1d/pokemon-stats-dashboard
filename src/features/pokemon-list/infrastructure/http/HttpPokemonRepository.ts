import { PokemonByType } from "../../domain/value-objects/PokemonByType";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { HttpClient } from "../../../../infrastructure/client/http/HttpClient";
import {
  RawPokemonByType,
  RawPokemonTypeResponse,
  RawPokemonDetailResponse,
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

  async findAllByType(type: PokemonType): Promise<PokemonByType[]> {
    const data = await this.http.get<RawPokemonTypeResponse>(
      `${this.config.typeEndpoint}${type.value}`
    );

    return data.pokemon.map(
      (rawItem: RawPokemonByType) => new PokemonByType(rawItem.pokemon.name)
    );
  }

  async findDetailsByName(name: string): Promise<PokemonByName> {
    const data = await this.http.get<RawPokemonDetailResponse>(
      `${this.config.pokemonEndpoint}${name}`
    );

    return new PokemonByName(
      data.name,
      data.height,
      data.sprites.front_default
    );
  }
}
