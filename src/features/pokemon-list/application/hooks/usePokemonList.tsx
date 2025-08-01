import { useState, useEffect } from "react";
import { PokemonListItem } from "../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { GetPokemonListUseCase } from "../use-cases/get-pokemon-list/GetPokemonListUseCase";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
}

const usePokemonList = (
  selectedType: string,
  repository: PokemonRepository
): UsePokemonListResult => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedType) {
      setPokemonList([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchPokemonList = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const useCase = new GetPokemonListUseCase(repository);
        const type = new PokemonType(selectedType);
        const result = await useCase.execute(type);
        setPokemonList(result);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
        setPokemonList([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonList();
  }, [selectedType, repository]);

  return { pokemonList, isLoading, isError };
};

export default usePokemonList;
