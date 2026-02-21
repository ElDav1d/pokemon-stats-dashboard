import { useState, useEffect, useMemo } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";
import { HttpPokemonRepository } from "../../http/HttpPokemonRepository";
import { FetchHttpClient } from "../../../../../shared/infrastructure/client/fetch/FetchHttpClient";
import { useAppSelector } from "../../../../../shared/infrastructure/redux/hooks";
import { useDebounce } from "../../../../../shared/infrastructure/react/hooks/useDebounce";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook that loads and transforms the pokemon list for the current type.
 *
 * ## Overload design
 * Supports four calling conventions sharing the same implementation:
 *
 *   Production (no filter):      usePokemonList(selectedType)
 *   Production (with filter):    usePokemonList(selectedType, filterByName)
 *   Testing (with repo):         usePokemonList(selectedType, mockRepository)
 *   Testing (repo + filter):     usePokemonList(selectedType, mockRepository, filterByName)
 *
 * The second param is detected at runtime:
 *   - string  → filterByName (production)
 *   - object  → PokemonRepository (testing / dependency injection)
 *
 * ## Internal separation: fetch vs. transformation
 * `useEffect` only fetches (runs when selectedType changes).
 * `useMemo` applies filter + sort without triggering new requests.
 * This prevents re-fetching when the user types in the filter or toggles sort.
 *
 * ## Debounce
 * filterByName is debounced 300ms internally to avoid recalculating
 * the list on every keystroke.
 */

// Overload for component usage (no filter)
function usePokemonList(selectedType: string): UsePokemonListResult;

// Overload for component usage (with filter)
function usePokemonList(
  selectedType: string,
  filterByName: string
): UsePokemonListResult;

// Overload for testing (with repository injection, no filter)
function usePokemonList(
  selectedType: string,
  repository: PokemonRepository
): UsePokemonListResult;

// Overload for testing (with repository injection and filter)
function usePokemonList(
  selectedType: string,
  repository: PokemonRepository,
  filterByName: string
): UsePokemonListResult;

// Implementation
function usePokemonList(
  selectedType: string,
  secondParam?: PokemonRepository | string,
  thirdParam?: string
): UsePokemonListResult {
  const [rawList, setRawList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const sortByHeight = useAppSelector(
    (state) => state.listControls.sortByHeight
  );

  const isRepositoryInjected =
    secondParam !== undefined && typeof secondParam !== "string";

  const filterByName =
    typeof secondParam === "string" ? secondParam : (thirdParam ?? "");

  const debouncedFilter = useDebounce(filterByName, 300);

  // Extract the injected repository separately so that changes to filterByName
  // (secondParam as a string) never cause repositoryInstance to recreate.
  const injectedRepository = isRepositoryInjected
    ? (secondParam as PokemonRepository)
    : undefined;

  const httpClient = useMemo(
    () => new FetchHttpClient("https://pokeapi.co/api/v2/"),
    []
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
    [repositoryInstance]
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

    if (debouncedFilter) {
      list = viewModel.filterPokemonsByName(rawList, debouncedFilter);
    }

    if (sortByHeight) {
      list = viewModel.sortPokemonListByHeight(list);
    }

    return list;
  }, [rawList, sortByHeight, debouncedFilter, viewModel]);

  return {
    pokemonList,
    isLoading,
    isError,
  };
}

export default usePokemonList;
