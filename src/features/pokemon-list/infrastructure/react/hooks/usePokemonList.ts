import { useState, useEffect, useMemo } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";
import { HttpPokemonRepository } from "../../http/HttpPokemonRepository";
import { FetchHttpClient } from "../../../../../infrastructure/client/fetch/FetchHttpClient";
import { useAppSelector } from "../../../../../infrastructure/redux/hooks";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
}

// Overload for component usage (Redux internally reads sortByHeight)
function usePokemonList(
  selectedType: string
): UsePokemonListResult;

// Overload for testing (with repository injection)
function usePokemonList(
  selectedType: string,
  repository: PokemonRepository
): UsePokemonListResult;

// Implementation
function usePokemonList(
  selectedType: string,
  repository?: PokemonRepository
): UsePokemonListResult {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const sortByHeight = useAppSelector((state) => state.listControls.sortByHeight);

  const isRepositoryInjected = repository !== undefined;

  const httpClient = useMemo(
    () => new FetchHttpClient("https://pokeapi.co/api/v2/"),
    []
  );

  const repositoryInstance = useMemo(() => {
    if (isRepositoryInjected) {
      return repository!;
    }
    return new HttpPokemonRepository(httpClient);
  }, [httpClient, isRepositoryInjected, repository]);

  const viewModel = useMemo(
    () => new PokemonListViewModel(repositoryInstance),
    [repositoryInstance]
  );

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
        let result = await viewModel.loadPokemonList(selectedType);

        if (sortByHeight) {
          result = viewModel.sortPokemonListByHeight(result);
        }

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
  }, [selectedType, viewModel, sortByHeight]);

  return {
    pokemonList,
    isLoading,
    isError,
  };
}

export default usePokemonList;
