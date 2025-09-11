import { url } from "../../../../lib/constants";
import { PokemonByType } from "../../domain/value-objects/PokemonByType";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { HttpClient } from "../../../../infraestructure/client/http/HttpClient";
import {
  RawPokemonByType,
  RawPokemonTypeResponse,
  RawPokemonDetailResponse,
} from "./dto/PokemonDTO";
import { PokemonByName } from "../../domain/value-objects/PokemonByName";

export class HttpPokemonRepository implements PokemonRepository {
  constructor(private readonly http: HttpClient) {}

  async findAllByType(type: PokemonType): Promise<PokemonByType[]> {
    const data = await this.http.get<RawPokemonTypeResponse>(
      `${url.BASE}${url.TYPE}${type.value}`
    );

    return data.pokemon.map(
      (rawItem: RawPokemonByType) =>
        new PokemonByType(rawItem.pokemon.name, rawItem.pokemon.url)
    );
  }

  async findDetailsByName(name: string): Promise<PokemonByName> {
    const data = await this.http.get<RawPokemonDetailResponse>(
      `${url.BASE}${url.POKEMON}${name}`
    );

    return new PokemonByName(
      data.name,
      data.height,
      data.sprites.front_default
    );
  }
}
