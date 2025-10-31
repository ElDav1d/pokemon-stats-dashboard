import { useEffect, useState } from "react";
import { PokemonTypesRepository } from "../domain/ports/PokemonTypesRepository";
import { GetPokemonTypesUseCase } from "../application/use-cases/get-pokemon-types/GetPokemonTypesUseCase";

interface IUsePokemonTypesReturn {
  typeNames: string[];
  isLoading: boolean;
  isError: boolean;
}

export const usePokemonTypes = (
  repository: PokemonTypesRepository
): IUsePokemonTypesReturn => {
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const getTypes = async () => {
      try {
        const useCase = new GetPokemonTypesUseCase(repository);
        const types = await useCase.execute();

        if (isMounted) {
          setTypeNames(types.map((type) => type.name));
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted) {
          setIsError(true);
          setIsLoading(false);
        }

        console.error("Error fetching types:", error);
      }
    };

    getTypes();

    return () => {
      isMounted = false;
    };
  }, [repository]);

  return { typeNames, isLoading, isError };
};

export default usePokemonTypes;
