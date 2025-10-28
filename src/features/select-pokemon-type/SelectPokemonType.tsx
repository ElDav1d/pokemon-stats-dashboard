import { useCallback } from "react";
import {
  SelectButton,
  SelectButtonList,
} from "../../components/select-button-list";
import PokemonType from "./domain/PokemonType";
import { usePokemonTypes, useSelectPokemonType } from "./hooks";
import { LoadingMessage, ErrorMessage } from "../../ui";

const SelectPokemonType = () => {
  const { typeNames, isLoading, isError } = usePokemonTypes();
  const { selectedTypeParam, selectType } = useSelectPokemonType(
    PokemonType.defaultType
  );

  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const target = e.target as HTMLButtonElement;
      const value = target.dataset.value;

      if (value && target.tagName === "BUTTON") {
        selectType(value);
      }
    },
    [selectType]
  );

  return (
    <>
      <h2
        className="text-lg l:text-xl xl:text-2xl mb-4"
        id="pokemon-type-list-heading"
      >
        Select a Pokemon Type to get the list
      </h2>

      {isLoading && <LoadingMessage message="Loading pokemon types..." />}

      {isError && <ErrorMessage message="Error loading pokemon types" />}

      {!isLoading && !isError && typeNames?.length > 0 && (
        <SelectButtonList
          aria-live="polite"
          aria-labelledby="pokemon-type-list-heading"
          optionNames={typeNames}
          onClick={handleButtonClick}
        >
          {(name) => (
            <SelectButton
              key={name}
              selected={selectedTypeParam === name}
              value={name}
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
