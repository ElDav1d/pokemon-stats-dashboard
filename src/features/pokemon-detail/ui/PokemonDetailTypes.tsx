import { SelectButton, SelectButtonList } from "../../../ui";
import usePokemonsByType from "../infrastructure/react/hooks/usePokemonsByType";
import PokemonDetailTypesPokemonList from "./PokemonDetailTypesPokemonList";

interface PokemonDetailTypesProps {
  types: string[];
}

const PokemonDetailTypes = ({ types }: PokemonDetailTypesProps) => {
  const { pokemonNames, selectedType, selectType } = usePokemonsByType();

  return (
    <section
      className="bg-stone-600 rounded-lg p-4 mb-4"
      aria-labelledby="pokemon-type-list-heading"
    >
      <h2
        className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold"
        id="pokemon-type-list-heading"
      >
        Types:
      </h2>
      {/* TODO: disable button for fetched type list */}
      <SelectButtonList
        aria-live="polite"
        aria-labelledby="pokemon-type-list-heading"
        optionNames={types}
      >
        {(name) => (
          <SelectButton
            key={name}
            value={name}
            selected={selectedType === name}
            onClick={() => selectType(name)}
          >
            {name}
          </SelectButton>
        )}
      </SelectButtonList>

      {pokemonNames.length > 0 && (
        <PokemonDetailTypesPokemonList pokemonNames={pokemonNames} />
      )}
    </section>
  );
};

export default PokemonDetailTypes;
