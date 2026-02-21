import PokemonListNameFilter from "./PokemonListNameFilter";
import PokemonListSortControl from "./PokemonListSortControl";

interface PokemonListControlsProps {
  isSortedByHeight: boolean;
  onSortChange: () => void;
  filterByName: string;
  onFilterByNameChange: (value: string) => void;
}

const PokemonListControls = ({
  isSortedByHeight,
  onSortChange,
  filterByName,
  onFilterByNameChange,
}: PokemonListControlsProps) => {
  return (
    <fieldset className="my-6">
      <legend className="text-lg l:text-xl xl:text-2xl">
        Order the pokemons:
      </legend>
      <PokemonListSortControl checked={isSortedByHeight} onChange={onSortChange} />
      <div className="mt-4">
        <PokemonListNameFilter value={filterByName} onChange={onFilterByNameChange} />
      </div>
    </fieldset>
  );
};

export default PokemonListControls;
