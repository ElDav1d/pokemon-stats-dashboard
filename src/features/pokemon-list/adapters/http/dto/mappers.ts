import { RawPokemonTypeResponse, RawPokemonDetail } from "./PokemonDTO";
import { Pokemon } from "../../../domain/entities/Pokemon";

export function mapToDomainList(
  rawList: RawPokemonTypeResponse,
  rawDetails: RawPokemonDetail[]
): Pokemon[] {
  return rawList.pokemon.map((item, index) => {
    const detail = rawDetails[index];

    return new Pokemon(
      item.pokemon.name,
      item.pokemon.url,
      detail.height,
      detail.sprites.front_default
    );
  });
}
