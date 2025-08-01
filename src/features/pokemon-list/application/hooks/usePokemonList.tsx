import { useState, useEffect } from "react";
import { PokemonListItem } from "../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { GetPokemonListUseCase } from "../use-cases/get-pokemon-list/GetPokemonListUseCase";

const usePokemonList = (
  selectedType: string,
  repository: PokemonRepository
): PokemonListItem[] => {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    if (!selectedType) {
      setPokemonList([]);
      return;
    }

    const fetchPokemonList = async () => {
      try {
        const useCase = new GetPokemonListUseCase(repository);
        const type = new PokemonType(selectedType);
        const result = await useCase.execute(type);
        setPokemonList(result);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
        setPokemonList([]);
      }
    };

    fetchPokemonList();
  }, [selectedType, repository]);

  return pokemonList;
};

export default usePokemonList;
