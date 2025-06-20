import { useState } from "react";
import { IPokemonListItem } from "../pokemon-list/entities";
import { Type } from "../../shared/entities";
import { url } from "../../lib/constants";

interface PokemonTypesProps {
  types: Type[];
}

const PokemonDetailTypes = ({ types }: PokemonTypesProps) => {
  const [pokemonList, setPokemonList] = useState<IPokemonListItem[]>([]);

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchList = async (type: string) => {
    setSelectedType(type);
    try {
      const response = await fetch(`${url.BASE}${url.TYPE}${type}`);
      if (!response.ok) throw new Error("Failed to fetch pokemon list");
      const data = await response.json();
      setPokemonList(data.pokemon);
    } catch (error) {
      console.error("Error fetching pokemon list:", error);
      setPokemonList([]);
    }
  };

  return (
    <section className="bg-stone-600  rounded-lg p-4 mb-4">
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Types:
      </h2>
      <ul aria-live="polite" className="flex flex-wrap gap-2 mb-2">
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

      {pokemonList.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-2" aria-live="polite">
          {pokemonList.map(({ pokemon }) => (
            <li className="capitalize" key={pokemon.name}>
              {pokemon.name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonDetailTypes;
