import {
  SelectButton,
  SelectButtonList,
} from "../../components/select-button-list";
import { usePokemonTypes, useSelectPokemonType } from "./hooks";

const SelectPokemonType = () => {
  const { typeNames, isLoading, isError } = usePokemonTypes();
  const { selectedTypeParam, selectType } = useSelectPokemonType("normal");

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

      {!isLoading && !isError && typeNames?.length > 0 && (
        <SelectButtonList
          aria-live="polite"
          aria-labelledby="pokemon-type-list-heading"
          optionNames={typeNames}
        >
          {(name) => (
            <SelectButton
              selected={selectedTypeParam === name}
              onClick={() => selectType(name)}
            >
              {name}
            </SelectButton>
          )}
        </SelectButtonList>
      )}
    </>
  );
};

export default SelectPokemonType;
