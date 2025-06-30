import { useEffect, useState } from "react";
import { services } from "../services";

const usePokemonTypes = () => {
  const [types, setTypes] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const getTypes = async () => {
      try {
        const typesList = await services.fetchPokemonTypes();

        if (isMounted) {
          setTypes(typesList);
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

  return { types, isLoading, isError };
};

export default usePokemonTypes;
