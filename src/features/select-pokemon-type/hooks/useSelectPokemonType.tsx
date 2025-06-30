import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const useSelectPokemonType = (defaultType = "normal") => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");

  useEffect(() => {
    setSearchParams((prev) => {
      if (!prev.has("type")) {
        prev.set("type", defaultType);
      }
      return prev;
    });
  }, [setSearchParams, defaultType]);

  const selectType = (type: string) => {
    setSearchParams({ type });
  };

  return { selectedTypeParam, selectType };
};

export default useSelectPokemonType;
