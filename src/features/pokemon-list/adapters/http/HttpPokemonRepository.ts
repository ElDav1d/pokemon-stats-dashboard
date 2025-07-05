import { url } from "../../../../lib/constants";
import { Pokemon } from "../../domain/entities/Pokemon";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";

export class HttpPokemonRepository implements PokemonRepository {
  async findByType(type: PokemonType): Promise<Pokemon[]> {
    const response = await fetch(`${url.BASE}${url.TYPE}${type.value}`);

    // TODO: review error propagation strategy when checking FetchHttpClient.ts use
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // TODO: check any WTF: why this cannot be RawPokemonTypeResponse?
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
