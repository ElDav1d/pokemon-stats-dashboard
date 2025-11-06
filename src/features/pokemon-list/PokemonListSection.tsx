import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import usePokemonList from "./infrastructure/react/hooks/usePokemonList";
import { useVirtualGridList } from "../../shared/infrastructure/react/hooks/useVirtualGridList";
import { pokemonListConfig, responsiveBreakpoints } from "./domain/constants";
import { LoadingMessage, ErrorMessage } from "../../ui";
import PokemonListControls from "./PokemonListControls";
import PokemonListGrid from "./PokemonListGrid";

const PokemonListSection = () => {
  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");
  const [isSortedByHeight, setIsSortedByHeight] = useState(false);

  // Hook 1: Data fetching and sorting logic
  const { pokemonList, isLoading, isError, sortByHeight } = usePokemonList(
    selectedTypeParam ?? ""
  );

  // Component composition: Apply sorting if enabled
  const sortablePokemonList = useMemo(() => {
    if (isSortedByHeight && pokemonList.length > 0) {
      return sortByHeight(pokemonList);
    }
    return pokemonList;
  }, [isSortedByHeight, pokemonList, sortByHeight]);

  // Hook 2: Virtualization for performance
  const { visibleItems, totalHeight } = useVirtualGridList(
    sortablePokemonList,
    {
      config: pokemonListConfig,
      breakpoints: responsiveBreakpoints,
    }
  );

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSortedByHeight(event.target.checked);
  };

  if (isLoading) {
    return (
      <section>
        <LoadingMessage message="Loading pokemon list..." />
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <ErrorMessage message="Error loading pokemon list. Please try again." />
      </section>
    );
  }

  return (
    <section>
      <PokemonListControls
        isSortedByHeight={isSortedByHeight}
        onSortChange={handleSortChange}
      />
      <PokemonListGrid visibleItems={visibleItems} totalHeight={totalHeight} />
    </section>
  );
};

export default PokemonListSection;
