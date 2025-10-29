import React from "react";

interface PokemonListControlsProps {
  isSortedByHeight: boolean;
  onSortChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PokemonListControls: React.FC<PokemonListControlsProps> = ({
  isSortedByHeight,
  onSortChange,
}) => {
  return (
    <fieldset className="my-6">
      <legend className="text-lg l:text-xl xl:text-2xl">
        Order the pokemons:
      </legend>
      <input
        className="mr-2"
        type="checkbox"
        id="height"
        name="height"
        checked={isSortedByHeight}
        onChange={onSortChange}
      />
      <label htmlFor="height">By height</label>
    </fieldset>
  );
};

export default PokemonListControls;
