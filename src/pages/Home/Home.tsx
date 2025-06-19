import { useState, useEffect, use } from "react";
import { useSearchParams } from "react-router-dom";
import { url } from "../../lib/constants";

export interface IPokemonListItem {
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}

const Home = () => {
  const [types, setTypes] = useState([]);
  const [pokemonList, setPokemonList] = useState<IPokemonListItem[]>([]);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");

  useEffect(() => {
    setSearchParams((prev) => {
      if (!prev.has("type")) {
        prev.set("type", "normal");
      }
      return prev;
    });
  }, [setSearchParams]);

  useEffect(() => {
    setSearchParams((prev) => {
      if (!prev.has("type")) {
        prev.set("type", "normal");
      }
      return prev;
    });

    const fetchTypes = async () => {
      const response = await fetch(`${url.BASE}${url.TYPE}`);

      if (!response.ok) {
        throw new Error("Failed to fetch types");
      }

      try {
        const data = await response.json();
        setTypes(data.results);
      } catch (error) {
        console.error("Error setting types:", error);
      }
    };

    fetchTypes();
  }, []);

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

  const selectType = (type: string) => {
    setSearchParams({ type });
  };

  return (
    <article>
      <h1>Pokemon Stats Dashboard</h1>

      <section>
        <h2>Select a type to view details</h2>
        {types.length > 0 && (
          <ul className="flex gap-2 overflow-x-auto">
            {types.map(({ name }) => (
              <li key={name}>
                <button
                  onClick={() => selectType(name)}
                  className={`${
                    selectedTypeParam === name ? "button-type-selected" : ""
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        {pokemonList.length > 0 && (
          <ul>
            {pokemonList.map(({ pokemon }) => (
              <li key={pokemon.name}>
                <h3>{pokemon.name}</h3>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
};

export default Home;
