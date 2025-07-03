import { useEffect, useState } from "react";
import { services } from "../services";
import { IPokemonTypeItem } from "../../../shared/entities";

interface IUsePokemonTypesReturn {
  typeNames: string[];
  isLoading: boolean;
  isError: boolean;
}

const usePokemonTypes = (): IUsePokemonTypesReturn => {
  const [typeNames, setTypeNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const getTypeNames = (types: IPokemonTypeItem[]) => {
    return types.map((type) => type.name);
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const getTypes = async () => {
      try {
        const typesResponse: IPokemonTypeItem[] =
          await services.fetchPokemonTypes();

        if (isMounted) {
          setTypeNames(getTypeNames(typesResponse));
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
  }, []);

  return { typeNames, isLoading, isError };
};

export default usePokemonTypes;
