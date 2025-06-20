import { useState } from "react";
import { IPokemonListItem } from "../pokemon-list/entities";
import { Type } from "../../shared/entities";
import { url } from "../../lib/constants";

interface PokemonTypesProps {
  types: Type[];
}

const PokemonDetailTypes = ({ types }: PokemonTypesProps) => {
  const [pokemonList, setPokemonList] = useState<IPokemonListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchList = async (type: string) => {
    setLoading(true);
    setSelectedType(type);
    try {
      const response = await fetch(`${url.BASE}${url.TYPE}${type}`);
      if (!response.ok) throw new Error("Failed to fetch pokemon list");
      const data = await response.json();
      setPokemonList(data.pokemon);
    } catch (error) {
      console.error("Error fetching pokemon list:", error);
      setPokemonList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>Types</h2>
      <ul aria-live="polite" className="flex gap-2 overflow-x-auto">
        {types.map((type) => (
          <li key={type.type.name}>
            <button
              onClick={() => fetchList(type.type.name)}
              className={
                selectedType === type.type.name ? "button-type-selected" : ""
              }
            >
              {type.type.name}
            </button>
          </li>
        ))}
      </ul>
      {loading && <div>Loading...</div>}
      {pokemonList.length > 0 && (
        <ul>
          {pokemonList.map(({ pokemon }) => (
            <li key={pokemon.name}>{pokemon.name}</li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonDetailTypes;
