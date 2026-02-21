import { PokemonListItem } from "../../../domain/entities/PokemonListItem";

export class FilterPokemonsByNameUseCase {
  static execute(list: PokemonListItem[], query: string): PokemonListItem[] {
    if (!query) return list;
    return list.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}
