import { PokemonListItem } from "../../../domain/entities/PokemonListItem";

export class FilterPokemonsByHeightRangeUseCase {
  static execute(
    list: PokemonListItem[],
    minHeight: number | undefined,
    maxHeight: number | undefined,
  ): PokemonListItem[] {
    const min = minHeight ?? 0;
    const max = maxHeight ?? 0;

    // If both min and max are provided and min is greater than max, return an empty array
    const isInvalidRange = min > 0 && max > 0 && min > max;

    if (isInvalidRange) {
      return [];
    }

    // A Pokemon is included if its height is greater than or equal to min (if min > 0) and less than or equal to max (if max > 0)
    return list.filter((pokemon) => {
      if (min > 0 && pokemon.height < min) {
        return false;
      }

      if (max > 0 && pokemon.height > max) {
        return false;
      }

      return true;
    });
  }
}
