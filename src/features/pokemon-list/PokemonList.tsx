import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { url } from "../../lib/constants";
import { IPokemonListItem, IPokemonListItemWithDetails } from "./entities";
import PokemonListItem from "./PokemonListItem";

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState<IPokemonListItemWithDetails[]>(
    []
  );
  const [isSortedByHeight, setIsSortedByHeight] = useState(false);

  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");

  useEffect(() => {
    if (!selectedTypeParam) return;

    const fetchItemDetails = async (pokemonName: string) => {
      if (!pokemonName) return;

      const response = await fetch(`${url.BASE}${url.POKEMON}${pokemonName}`);

      if (!response.ok) {
        throw new Error("Failed to fetch pokemon details");
      }

      try {
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Error fetching pokemon details:", error);
      }
    };

    const fetchList = async (type: string | null) => {
      if (!type) return;

      const response = await fetch(`${url.BASE}${url.TYPE}${type}`);

      if (!response.ok) {
        throw new Error("Failed to fetch pokemon list");
      }

      try {
        const data = await response.json();

        const pokemonDetailsPromises = data.pokemon.map(
          (pokemonItem: IPokemonListItem) =>
            fetchItemDetails(pokemonItem.pokemon.name)
        );

        const pokemonDetails = await Promise.all(pokemonDetailsPromises);

        const pokemonList: IPokemonListItemWithDetails[] = data.pokemon.map(
          (pokemonItem: IPokemonListItem, index: number) => ({
            pokemon: {
              name: pokemonItem.pokemon.name,
              url: pokemonItem.pokemon.url,
            },
            details: pokemonDetails[index],
          })
        );

        setPokemonList(pokemonList);
      } catch (error) {
        console.error("Error fetching pokemon details:", error);
      }
    };

    fetchList(selectedTypeParam);
  }, [selectedTypeParam]);

  const orderByHeight = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setIsSortedByHeight(isChecked);
  };

  const sortByHeight = (pokemonList: IPokemonListItemWithDetails[]) => {
    return [...pokemonList].sort((a, b) => a.details.height - b.details.height);
  };

  const sortedPokemonList = useMemo(
    () => (isSortedByHeight ? sortByHeight(pokemonList) : pokemonList),
    [isSortedByHeight, pokemonList]
  );

  return (
    <section>
      <fieldset className="mb-6">
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
      {sortedPokemonList.length > 0 && (
        <ul>
          {sortedPokemonList.map(({ pokemon, details }) => (
            <PokemonListItem
              key={pokemon.name}
              pokemon={pokemon}
              height={details.height}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonList;
