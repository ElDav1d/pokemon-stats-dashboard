import { PokemonListItem } from "../../../domain/entities/PokemonListItem";

export class SortPokemonsByHeightUseCase {
  static execute(list: PokemonListItem[]): PokemonListItem[] {
    return [...list].sort((a, b) => a.height - b.height);
  }
}
