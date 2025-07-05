import { url } from "../../../../lib/constants";
import { Pokemon } from "../../domain/entities/Pokemon";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";

export class HttpPokemonRepository implements PokemonRepository {
  async findByType(type: PokemonType): Promise<Pokemon[]> {
    const response = await fetch(`${url.BASE}${url.TYPE}${type.value}`);

    const data = await response.json();
    return data.pokemon.map(
      (p: any) => new Pokemon(p.name, p.url, p.height, p.sprites.front_default)
    );
  }
}
