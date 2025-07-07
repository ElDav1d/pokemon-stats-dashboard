import { url } from "../../../../lib/constants";
import { Pokemon } from "../../domain/entities/Pokemon";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { HttpClient } from "../../../../infraestructure/http/HttpClient";
import { RawPokemonTypeResponse } from "./dto/PokemonDTO";

export class HttpPokemonRepository implements PokemonRepository {
  constructor(private readonly http: HttpClient) {}

  async findByType(type: PokemonType): Promise<Pokemon[]> {
    const data = await this.http.get<RawPokemonTypeResponse>(
      `${url.BASE}${url.TYPE}${type.value}`
    );

    return data.pokemon.map(
      (pokemon: any) =>
        new Pokemon(
          pokemon.name,
          pokemon.url,
          pokemon.height,
          pokemon.sprites.front_default
        )
    );
  }
}
