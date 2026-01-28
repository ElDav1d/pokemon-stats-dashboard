import { SelectButton, SelectButtonList, SubHeading } from "../../../ui";
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
      <SubHeading title="Types:" id="pokemon-type-list-heading" />

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
            disabled={selectedType === name}
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
