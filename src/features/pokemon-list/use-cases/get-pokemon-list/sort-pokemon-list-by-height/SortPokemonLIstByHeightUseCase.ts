import { Pokemon } from "../../../domain/entities/Pokemon";

export class SortPokemonsByHeightUseCase {
  static execute(list: Pokemon[]): Pokemon[] {
    return [...list].sort((a, b) => a.height - b.height);
  }
}
