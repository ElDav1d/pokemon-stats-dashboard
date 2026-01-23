import { useState, useCallback, useMemo } from "react";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";
import { PokemonsByTypeViewModel } from "../../../application/view-models/PokemonsByTypeViewModel";
import { HttpPokemonDetailRepository } from "../../http/HttpPokemonDetailRepository";

interface UsePokemonsByTypeResult {
  pokemonNames: string[];
  selectedType: string | null;
  isLoading: boolean;
  isError: boolean;
  selectType: (typeName: string) => Promise<void>;
}

// Overload for component usage
function usePokemonsByType(): UsePokemonsByTypeResult;

// Overload for testing (with repository injection)
function usePokemonsByType(
  repository: PokemonDetailRepository,
): UsePokemonsByTypeResult;

function usePokemonsByType(
  repository?: PokemonDetailRepository,
): UsePokemonsByTypeResult {
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const isRepositoryInjected = repository !== undefined;

  const repositoryInstance = useMemo(() => {
    if (isRepositoryInjected) {
      return repository;
    }
    return new HttpPokemonDetailRepository("https://pokeapi.co/api/v2/", {
      pokemonEndpoint: "pokemon/",
      typeEndpoint: "type/",
    });
  }, [isRepositoryInjected, repository]);

  const viewModel = useMemo(
    () => new PokemonsByTypeViewModel(repositoryInstance),
    [repositoryInstance],
  );

  const selectType = useCallback(
    async (typeName: string) => {
      setSelectedType(typeName);
      setIsLoading(true);
      setIsError(false);

      try {
        const pokemonList = await viewModel.loadPokemonsByType(typeName);
        const names = viewModel.getPokemonNames(pokemonList);
        setPokemonNames(names);
      } catch (error) {
        console.error("Error fetching pokemon by type:", error);
        setPokemonNames([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [viewModel],
  );

  return {
    pokemonNames,
    selectedType,
    isLoading,
    isError,
    selectType,
  };
}

export default usePokemonsByType;
