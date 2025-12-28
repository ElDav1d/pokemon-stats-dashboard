import { useState, useEffect, useMemo } from "react";
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";
import { PokemonDetailViewModel } from "../../../application/view-models/PokemonDetailViewModel";
import { HttpPokemonDetailRepository } from "../../http/HttpPokemonDetailRepository";

interface UsePokemonDetailResult {
  pokemonDetail: PokemonDetail | null;
  evolutionChain: EvolutionChain | null;
  evolutions: string[];
  isLoading: boolean;
  isError: boolean;
}

// Overload for component usage
function usePokemonDetail(name: string): UsePokemonDetailResult;

// Overload for testing (with repository injection)
function usePokemonDetail(
  name: string,
  repository: PokemonDetailRepository
): UsePokemonDetailResult;

function usePokemonDetail(
  name: string,
  repository?: PokemonDetailRepository
): UsePokemonDetailResult {
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetail | null>(
    null
  );
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(
    null
  );
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
    () => new PokemonDetailViewModel(repositoryInstance),
    [repositoryInstance]
  );

  useEffect(() => {
    if (!name) {
      setPokemonDetail(null);
      setEvolutionChain(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const detail = await viewModel.loadPokemonDetail(name);
        setPokemonDetail(detail);

        if (detail?.speciesUrl) {
          const chain = await viewModel.loadEvolutionChain(detail.speciesUrl);
          setEvolutionChain(chain);
        }
      } catch (error) {
        console.error("Error fetching pokemon detail:", error);
        setPokemonDetail(null);
        setEvolutionChain(null);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [name, viewModel]);

  const evolutions = useMemo(() => {
    if (!evolutionChain || !pokemonDetail) {
      return [];
    }
    return viewModel.getEvolutionsExcluding(evolutionChain, pokemonDetail.name);
  }, [evolutionChain, pokemonDetail, viewModel]);

  return {
    pokemonDetail,
    evolutionChain,
    evolutions,
    isLoading,
    isError,
  };
}

export default usePokemonDetail;
