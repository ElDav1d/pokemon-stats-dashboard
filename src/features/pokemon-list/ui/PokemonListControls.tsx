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
      <legend className="sr-only">List controls</legend>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <PokemonListNameFilter value={filterByName} onChange={onFilterByNameChange} />
        <PokemonListSortControl checked={isSortedByHeight} onChange={onSortChange} />
      </div>
    </fieldset>
  );
};

export default PokemonListControls;
