import { useSearchParams } from "react-router-dom";
import usePokemonList from "./infrastructure/react/hooks/usePokemonList";
import { useListControls } from "./infrastructure/react/hooks/useListControls";
import { useVirtualGridList } from "../../infrastructure/react/hooks/useVirtualGridList";
import { pokemonListConfig, responsiveBreakpoints } from "./domain/constants";
import { LoadingMessage, ErrorMessage } from "../../ui";
import PokemonListControls from "./PokemonListControls";
import PokemonListGrid from "./PokemonListGrid";

const PokemonListSection = () => {
  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");
  const { sortByHeight: isSortedByHeight, handleToggleSortByHeight } = useListControls();

  const { pokemonList, isLoading, isError } = usePokemonList(
    selectedTypeParam ?? ""
  );

  const { visibleItems, totalHeight } = useVirtualGridList(
    pokemonList,
    {
      config: pokemonListConfig,
      breakpoints: responsiveBreakpoints,
    }
  );

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
      />
      <PokemonListGrid visibleItems={visibleItems} totalHeight={totalHeight} />
    </section>
  );
};

export default PokemonListSection;
