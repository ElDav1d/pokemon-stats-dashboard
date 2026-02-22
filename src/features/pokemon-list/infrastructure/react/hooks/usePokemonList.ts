import { useState, useEffect, useMemo } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";
import { HttpPokemonRepository } from "../../http/HttpPokemonRepository";
import { FetchHttpClient } from "../../../../../shared/infrastructure/client/fetch/FetchHttpClient";
import { useAppSelector } from "../../../../../shared/infrastructure/redux/hooks";
import { useDebounce } from "../../../../../shared/infrastructure/react/hooks/useDebounce";

export interface ListFilters {
  filterByName?: string;
  filterByMinHeight?: number;
  filterByMaxHeight?: number;
}

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook that loads and transforms the pokemon list for the current type.
 *
 * ## Overload design
 * Supports two calling conventions sharing the same implementation:
 *
 *   Production (no filter):   usePokemonList(selectedType)
 *   Production (with filter): usePokemonList(selectedType, filters)
 *   Testing (with repo):      usePokemonList(selectedType, mockRepository)
 *   Testing (repo + filter):  usePokemonList(selectedType, mockRepository, filters)
 *
 * The second param is detected at runtime:
 *   - object with "findAllByType" → PokemonRepository (testing / dependency injection)
 *   - ListFilters object or undefined → filter values (production)
 *
 * ## Internal separation: fetch vs. transformation
 * `useEffect` only fetches (runs when selectedType changes).
 * `useMemo` applies filter + sort without triggering new requests.
 * This prevents re-fetching when the user types in the filter or toggles sort.
 *
 * ## Debounce
 * filterByName is debounced 300ms internally to avoid recalculating
 * the list on every keystroke. filterByMinHeight and filterByMaxHeight
 * are applied without debounce (number inputs fire fewer events).
 */

// Overload for component usage (no filter or with ListFilters)
function usePokemonList(
  selectedType: string,
  filters?: ListFilters,
): UsePokemonListResult;

// Overload for testing (with repository injection, optional ListFilters)
function usePokemonList(
  selectedType: string,
  repository: PokemonRepository,
  filters?: ListFilters,
): UsePokemonListResult;

// Implementation
function usePokemonList(
  selectedType: string,
  secondParam?: PokemonRepository | ListFilters,
  thirdParam?: ListFilters,
): UsePokemonListResult {
  const [rawList, setRawList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const sortByHeight = useAppSelector(
    (state) => state.listControls.sortByHeight,
  );

  const isRepositoryInjected =
    secondParam !== undefined && "findAllByType" in secondParam;

  const filters: ListFilters = isRepositoryInjected
    ? (thirdParam ?? {})
    : ((secondParam as ListFilters | undefined) ?? {});

  const {
    filterByName = "",
    filterByMinHeight = 0,
    filterByMaxHeight = 0,
  } = filters;

  const debouncedFilterByName = useDebounce(filterByName, 300);

  const injectedRepository = isRepositoryInjected
    ? (secondParam as PokemonRepository)
    : undefined;

  const httpClient = useMemo(
    () => new FetchHttpClient("https://pokeapi.co/api/v2/"),
    [],
  );

  const repositoryInstance = useMemo(() => {
    if (injectedRepository !== undefined) {
      return injectedRepository;
    }
    return new HttpPokemonRepository(httpClient, {
      typeEndpoint: "type/",
      pokemonEndpoint: "pokemon/",
    });
  }, [httpClient, injectedRepository]);

  const viewModel = useMemo(
    () => new PokemonListViewModel(repositoryInstance),
    [repositoryInstance],
  );

  useEffect(() => {
    if (!selectedType) {
      setRawList([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const result = await viewModel.loadPokemonList(selectedType);
        setRawList(result);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
        setRawList([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedType, viewModel]);

  // Apply transformations: filter first, then sort. rawList is never mutated.
  const pokemonList = useMemo(() => {
    let list = rawList;

    if (debouncedFilterByName) {
      list = viewModel.filterPokemonsByName(list, debouncedFilterByName);
    }

    if (filterByMinHeight > 0 || filterByMaxHeight > 0) {
      list = viewModel.filterPokemonsByHeightRange(
        list,
        filterByMinHeight,
        filterByMaxHeight,
      );
    }

    if (sortByHeight) {
      list = viewModel.sortPokemonListByHeight(list);
    }

    return list;
  }, [
    rawList,
    sortByHeight,
    debouncedFilterByName,
    filterByMinHeight,
    filterByMaxHeight,
    viewModel,
  ]);

  return {
    pokemonList,
    isLoading,
    isError,
  };
}

export default usePokemonList;
