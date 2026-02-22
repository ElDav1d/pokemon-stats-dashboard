import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonListItem } from "../../domain/entities/PokemonListItem";
import { GetPokemonListUseCase } from "../use-cases/get-pokemon-list/GetPokemonListUseCase";
import { SortPokemonsByHeightUseCase } from "../use-cases/sort-pokemon-list-by-height/SortPokemonLIstByHeightUseCase";
import { FilterPokemonsByNameUseCase } from "../use-cases/filter-pokemons-by-name/FilterPokemonsByNameUseCase";
import { FilterPokemonsByHeightRangeUseCase } from "../use-cases/filter-pokemons-by-height-range/FilterPokemonsByHeightRangeUseCase";
import { PokemonType } from "../../../../shared/domain/value-objects/PokemonType";

export class PokemonListViewModel {
  constructor(private readonly repository: PokemonRepository) {}

  async loadPokemonList(type: string): Promise<PokemonListItem[]> {
    if (type === "") {
      return [];
    }

    const pokemonType = new PokemonType(type);
    const useCase = new GetPokemonListUseCase(this.repository);
    const result = await useCase.execute(pokemonType);

    return result;
  }

  sortPokemonListByHeight(list: PokemonListItem[]): PokemonListItem[] {
    return SortPokemonsByHeightUseCase.execute(list);
  }

  filterPokemonsByName(list: PokemonListItem[], query: string): PokemonListItem[] {
    return FilterPokemonsByNameUseCase.execute(list, query);
  }

  filterPokemonsByHeightRange(
    list: PokemonListItem[],
    minHeight: number,
    maxHeight: number
  ): PokemonListItem[] {
    return FilterPokemonsByHeightRangeUseCase.execute(list, minHeight, maxHeight);
  }
}
