import { useEffect, useState } from "react";
import { url } from "../../lib/constants";

export function usePokemonTypes() {
  const [types, setTypes] = useState<{ name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    const fetchTypes = async () => {
      try {
        const response = await fetch(`${url.BASE}${url.TYPE}`);

        if (!response.ok) throw new Error("Failed to fetch types");
        const data = await response.json();

        if (isMounted) {
          setTypes(data.results);
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

    fetchTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  return { types, isLoading, isError };
}
