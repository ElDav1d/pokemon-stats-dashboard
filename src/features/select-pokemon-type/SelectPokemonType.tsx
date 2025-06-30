import { usePokemonTypes, useSelectPokemonType } from "./hooks";

const SelectPokemonType = () => {
  const { types, isLoading, isError } = usePokemonTypes();
  const { selectedTypeParam, selectType } = useSelectPokemonType();

  return (
    <>
      <h2
        className="text-lg l:text-xl xl:text-2xl mb-4"
        id="pokemon-type-list-heading"
      >
        Select a Pokemon Type to get the list
      </h2>

      {isLoading && (
        <h3 className="text-center text-gray-500">Loading pokemon types...</h3>
      )}

      {isError && (
        <h3 className="text-center text-red-500">
          Error loading pokemon types
        </h3>
      )}

      {!isLoading && !isError && types?.length > 0 && (
        <ul
          className="flex flex-wrap gap-2 mb-6"
          aria-live="polite"
          aria-labelledby="pokemon-type-list-heading"
        >
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
    </>
  );
};

export default SelectPokemonType;
