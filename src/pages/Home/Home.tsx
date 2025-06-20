import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { paths, url } from "../../lib/constants";
import { SelectPokemonType } from "../../features/select-pokemon-type";

export interface IPokemonListItem {
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}

const Home = () => {
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
    <article>
      <h1>Pokemon Stats Dashboard</h1>

      <SelectPokemonType />

      <section>
        {pokemonList.length > 0 && (
          <ul>
            {pokemonList.map(({ pokemon }) => (
              <li key={pokemon.name}>
                <Link to={`${paths.BASE}${pokemon.name}`}>
                  <h3>{pokemon.name}</h3>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};

export default Home;
