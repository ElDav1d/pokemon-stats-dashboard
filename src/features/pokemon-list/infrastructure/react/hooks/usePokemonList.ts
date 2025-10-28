import { useState, useEffect, useMemo, useCallback } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";
import { HttpPokemonRepository } from "../../http/HttpPokemonRepository";
import { FetchHttpClient } from "../../../../../infrastructure/client/fetch/FetchHttpClient";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
  sortByHeight: (list: PokemonListItem[]) => PokemonListItem[];
}

// Overload for component usage (with boolean flag)
function usePokemonList(
  selectedType: string,
  shouldSortByHeight?: boolean
): UsePokemonListResult;

// Overload for testing (with repository injection)
function usePokemonList(
  selectedType: string,
  repository: PokemonRepository
): UsePokemonListResult;

// Implementation
function usePokemonList(
  selectedType: string,
  secondParam?: boolean | PokemonRepository
): UsePokemonListResult {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // Determine if second param is a repository (for testing) or a boolean flag (for component)
  const isRepositoryInjected =
    secondParam && typeof secondParam === "object" && "findAllByType" in secondParam;

  // Infrastructure setup (only if not injected for testing)
  const httpClient = useMemo(
    () => new FetchHttpClient("https://pokeapi.co/api/v2/"),
    []
  );

  const repository = useMemo(() => {
    if (isRepositoryInjected) {
      return secondParam as PokemonRepository;
    }
    return new HttpPokemonRepository(httpClient);
  }, [httpClient, isRepositoryInjected, secondParam]);

  const viewModel = useMemo(
    () => new PokemonListViewModel(repository),
    [repository]
  );

  // Expose sorting function to component for composition
  const sortByHeight = useCallback(
    (list: PokemonListItem[]) => viewModel.sortPokemonListByHeight(list),
    [viewModel]
  );

  // Data fetching
  useEffect(() => {
    if (!selectedType) {
      setPokemonList([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const result = await viewModel.loadPokemonList(selectedType);
        setPokemonList(result);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
        setPokemonList([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedType, viewModel]);

  return {
    pokemonList,
    isLoading,
    isError,
    sortByHeight,
  };
};

export default usePokemonList;
