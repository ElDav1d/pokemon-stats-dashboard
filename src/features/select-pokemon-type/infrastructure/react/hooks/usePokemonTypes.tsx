import { useEffect, useState, useMemo } from "react";
import { PokemonTypesRepository } from "../../../domain/ports/PokemonTypesRepository";
import { GetPokemonTypesUseCase } from "../../../application/use-cases/get-pokemon-types/GetPokemonTypesUseCase";
import { HttpPokemonTypesRepository } from "../../http/HttpPokemonTypesRepository";
import { url } from "../../../../../lib/constants";

interface IUsePokemonTypesReturn {
  typeNames: string[];
  isLoading: boolean;
  isError: boolean;
}

// Overload for component usage (no parameters)
function usePokemonTypes(): IUsePokemonTypesReturn;

// Overload for testing (with repository injection)
function usePokemonTypes(
  repository: PokemonTypesRepository
): IUsePokemonTypesReturn;

// Implementation
function usePokemonTypes(
  repository?: PokemonTypesRepository
): IUsePokemonTypesReturn {
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Determine if repository was injected (for testing)
  const isRepositoryInjected =
    repository &&
    typeof repository === "object" &&
    "findAll" in repository;

  const resolvedRepository = useMemo(() => {
    if (isRepositoryInjected) {
      return repository;
    }
    return new HttpPokemonTypesRepository(url.BASE);
  }, [isRepositoryInjected, repository]);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const getTypes = async () => {
      try {
        const useCase = new GetPokemonTypesUseCase(resolvedRepository);
        const types = await useCase.execute();

        if (isMounted) {
          setTypeNames(types.map((type) => type.value));
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
  }, [resolvedRepository]);

  return { typeNames, isLoading, isError };
}

export default usePokemonTypes;
