import { useState, useEffect, useMemo } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";
import { HttpPokemonRepository } from "../../http/HttpPokemonRepository";
import { FetchHttpClient } from "../../../../../shared/infrastructure/client/fetch/FetchHttpClient";
import { useAppSelector } from "../../../../../shared/infrastructure/redux/hooks";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
}

// Overload for component usage (Redux internally reads sortByHeight)
function usePokemonList(selectedType: string): UsePokemonListResult;

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
  const [rawList, setRawList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const sortByHeight = useAppSelector(
    (state) => state.listControls.sortByHeight
  );

  const isRepositoryInjected = repository !== undefined;

  const httpClient = useMemo(
    () => new FetchHttpClient("https://pokeapi.co/api/v2/"),
    []
  );

  const repositoryInstance = useMemo(() => {
    if (isRepositoryInjected) {
      return repository!;
    }
    return new HttpPokemonRepository(httpClient, {
      typeEndpoint: "type/",
      pokemonEndpoint: "pokemon/",
    });
  }, [httpClient, isRepositoryInjected, repository]);

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

  const pokemonList = useMemo(() => {
    if (sortByHeight) return viewModel.sortPokemonListByHeight(rawList);
    return rawList;
  }, [rawList, sortByHeight, viewModel]);

  return {
    pokemonList,
    isLoading,
    isError,
  };
}

export default usePokemonList;
