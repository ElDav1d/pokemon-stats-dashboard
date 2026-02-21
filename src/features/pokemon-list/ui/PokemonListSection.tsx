import { useSearchParams } from "react-router-dom";
import usePokemonList from "../infrastructure/react/hooks/usePokemonList";
import { useVirtualGridList } from "../../../shared/infrastructure/react/hooks/useVirtualGridList";
import { useListControls } from "../infrastructure/react/hooks/useListControls";
import { pokemonListConfig, responsiveBreakpoints } from "../domain/constants";
import { LoadingMessage, ErrorMessage } from "../../../ui";
import PokemonListControls from "./PokemonListControls";
import PokemonListGrid from "./PokemonListGrid";

const PokemonListSection = () => {
  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");
  const {
    sortByHeight: isSortedByHeight,
    handleToggleSortByHeight,
    filterByName,
    setFilterByName,
  } = useListControls();

  const { pokemonList, isLoading, isError } = usePokemonList(
    selectedTypeParam ?? "",
    filterByName
  );

  const { visibleItems, totalHeight } = useVirtualGridList(pokemonList, {
    config: pokemonListConfig,
    breakpoints: responsiveBreakpoints,
  });

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
        onSortChange={handleToggleSortByHeight}
        filterByName={filterByName}
        onFilterByNameChange={setFilterByName}
      />
      {filterByName && pokemonList.length === 0 && (
        <output>Sorry, we cannot find Pokémon with that name</output>
      )}
      <PokemonListGrid visibleItems={visibleItems} totalHeight={totalHeight} />
    </section>
  );
};

export default PokemonListSection;
