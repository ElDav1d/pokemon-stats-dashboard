import { useState, useEffect, useMemo, useCallback } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
  sortByHeight: (list: PokemonListItem[]) => PokemonListItem[];
}

const usePokemonList = (
  selectedType: string,
  repository: PokemonRepository
): UsePokemonListResult => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const viewModel = useMemo(
    () => new PokemonListViewModel(repository),
    [repository]
  );

  const sortByHeight = useCallback(
    (list: PokemonListItem[]) => viewModel.sortPokemonListByHeight(list),
    [viewModel]
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

  return { pokemonList, isLoading, isError, sortByHeight };
};

export default usePokemonList;
