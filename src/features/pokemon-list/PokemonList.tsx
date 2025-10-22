import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { url } from "../../lib/constants";
import PokemonListItem from "./PokemonListItem";
import { useVirtualGridList } from "../../infrastructure/react/hooks/useVirtualGridList";
import usePokemonList from "./infrastructure/react/hooks/usePokemonList";
import { HttpPokemonRepository } from "./adapters/http/HttpPokemonRepository";
import { FetchHttpClient } from "../../infrastructure/client/fetch/FetchHttpClient";
import { pokemonListConfig, responsiveBreakpoints } from "./domain/constants";

const PokemonList = () => {
  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");
  const [isSortedByHeight, setIsSortedByHeight] = useState(false);

  // Initialize repository for the hook
  const httpClient = useMemo(() => new FetchHttpClient(url.BASE), []);
  const repository = useMemo(
    () => new HttpPokemonRepository(httpClient),
    [httpClient]
  );

  const safeParamType = selectedTypeParam ?? "";

  const { pokemonList, isLoading, isError, sortByHeight } = usePokemonList(
    safeParamType,
    repository
  );

  const sortablePokemonList = useMemo(() => {
    if (isSortedByHeight) {
      return sortByHeight(pokemonList);
    }
    return pokemonList;
  }, [isSortedByHeight, pokemonList, sortByHeight]);

  const { visibleItems, totalHeight } = useVirtualGridList(
    sortablePokemonList,
    {
      config: pokemonListConfig,
      breakpoints: responsiveBreakpoints,
    }
  );

  const orderByHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsSortedByHeight(event.target.checked);
  };

  if (isLoading) {
    return (
      <section>
        <h3 className="text-center my-4 text-gray-500">
          Loading pokemon list...
        </h3>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h3 className="text-center my-4 text-red-500">
          Error loading pokemon list. Please try again.
        </h3>
      </section>
    );
  }

  return (
    <section>
      <fieldset className="my-6">
        <legend className="text-lg l:text-xl xl:text-2xl">
          Order the pokemons:
        </legend>
        <input
          className="mr-2"
          type="checkbox"
          id="height"
          name="height"
          onChange={orderByHeight}
        />
        <label htmlFor="height">By height</label>
      </fieldset>
      {sortablePokemonList.length > 0 && (
        <ul
          aria-label="Pokemon List"
          aria-live="polite"
          className="relative"
          style={{
            minHeight: `${totalHeight}px`, // Set the total height to enable proper scrolling
          }}
        >
          {/* Spacer to maintain total height */}
          <li
            className="absolute top-0 left-0 pointer-events-none invisible"
            style={{
              height: totalHeight,
            }}
            aria-hidden="true"
          />
          {visibleItems.map(({ item, offsetY, offsetX, width }) => (
            <li
              key={item.id}
              className="absolute"
              style={{
                top: offsetY,
                left: offsetX,
                width: width,
                height: pokemonListConfig.itemHeight,
              }}
            >
              <PokemonListItem
                name={item.name}
                height={item.height}
                imageUrl={item.imageUrl}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonList;
