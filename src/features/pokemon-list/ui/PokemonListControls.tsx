import React from "react";

interface PokemonListControlsProps {
  isSortedByHeight: boolean;
  onSortChange: () => void;
  filterByName: string;
  onFilterByNameChange: (value: string) => void;
}

const PokemonListControls: React.FC<PokemonListControlsProps> = ({
  isSortedByHeight,
  onSortChange,
  filterByName,
  onFilterByNameChange,
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
      <div className="mt-4">
        <label htmlFor="search-by-name">Search by name</label>
        <input
          className="ml-2 border text-gray-900"
          type="search"
          id="search-by-name"
          name="search-by-name"
          value={filterByName}
          onChange={(e) => onFilterByNameChange(e.target.value)}
        />
      </div>
    </fieldset>
  );
};

export default PokemonListControls;
