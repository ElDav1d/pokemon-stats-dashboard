import { SelectButton, SelectButtonList } from "../../../ui";
import usePokemonsByType from "../infrastructure/react/hooks/usePokemonsByType";

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
            onClick={() => selectType(name)} // TODO: memoize?
          >
            {name}
          </SelectButton>
        )}
      </SelectButtonList>

      {pokemonNames.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-2 mt-4" aria-live="polite">
          {pokemonNames.map((name) => (
            <li className="capitalize" key={name}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonDetailTypes;
