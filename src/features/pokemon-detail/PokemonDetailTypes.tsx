import { useState } from "react";
import { IPokemonListItem } from "../pokemon-list/entities";
import { Type } from "../../shared/entities";
import { url } from "../../lib/constants";
import {
  SelectButton,
  SelectButtonList,
} from "../../components/select-button-list";

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

  const getTypeName = (obj: { name: string }): string => obj.name;

  return (
    <section className="bg-stone-600  rounded-lg p-4 mb-4">
      <h2
        className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold"
        id="pokemon-type-list-heading"
      >
        Types:
      </h2>
      <SelectButtonList
        aria-live="polite"
        aria-labelledby="pokemon-type-list-heading"
        items={types}
        getKey={(type) => getTypeName(type.type)}
      >
        {(type) => (
          <SelectButton
            selected={selectedType === type.type.name}
            onClick={() => fetchList(type.type.name)}
          >
            {type.type.name}
          </SelectButton>
        )}
      </SelectButtonList>

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
