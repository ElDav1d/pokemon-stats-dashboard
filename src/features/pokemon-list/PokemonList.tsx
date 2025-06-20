import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { url } from "../../lib/constants";
import { IPokemonListItem } from "./entities";
import PokemonListItem from "./PokemonListItem";

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState<IPokemonListItem[]>([]);

  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");

  useEffect(() => {
    if (!selectedTypeParam) return;

    const fetchList = async (type: string | null) => {
      if (!type) return;

      const response = await fetch(`${url.BASE}${url.TYPE}${type}`);

      if (!response.ok) {
        throw new Error("Failed to fetch pokemon list");
      }

      try {
        const data = await response.json();
        setPokemonList(data.pokemon);
      } catch (error) {
        console.error("Error fetching pokemon details:", error);
      }
    };

    fetchList(selectedTypeParam);
  }, [selectedTypeParam]);

  return (
    <section>
      {pokemonList.length > 0 && (
        <ul>
          {pokemonList.map(({ pokemon }) => (
            <PokemonListItem key={pokemon.name} pokemon={pokemon} />
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonList;
