import { useState } from "react";
import { Type } from "../../pages/Detail/entities";
import { url } from "../../lib/constants";
import {
  SelectButton,
  SelectButtonList,
} from "../../components/select-button-list";

type PokemonItem = {
  name: string;
  url: string;
};

interface IPokemonListItem {
  pokemon: PokemonItem;
  slot: number;
}

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

  const getOptionNames = (types: Type[]) => {
    return types.map((type) => type.type.name);
  };

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
        optionNames={getOptionNames(types)}
      >
        {(name) => (
          <SelectButton
            value={name}
            selected={selectedType === name}
            onClick={() => fetchList(name)}
          >
            {name}
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
