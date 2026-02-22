import PokemonListNameFilter from "./PokemonListNameFilter";
import PokemonListSortControl from "./PokemonListSortControl";
import PokemonListHeightRangeFilter from "./PokemonListHeightRangeFilter";

interface PokemonListControlsProps {
  isSortedByHeight: boolean;
  onSortChange: () => void;
  filterByName: string;
  onFilterByNameChange: (value: string) => void;
  filterByMinHeight: number;
  filterByMaxHeight: number;
  isInvalidHeightRange: boolean;
  onFilterByMinHeightChange: (value: number) => void;
  onFilterByMaxHeightChange: (value: number) => void;
}

const PokemonListControls = ({
  isSortedByHeight,
  onSortChange,
  filterByName,
  onFilterByNameChange,
  filterByMinHeight,
  filterByMaxHeight,
  isInvalidHeightRange,
  onFilterByMinHeightChange,
  onFilterByMaxHeightChange,
}: PokemonListControlsProps) => {
  return (
    <fieldset className="my-6">
      <legend className="sr-only">List controls</legend>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <PokemonListNameFilter value={filterByName} onChange={onFilterByNameChange} />
        <PokemonListHeightRangeFilter
          minValue={filterByMinHeight}
          maxValue={filterByMaxHeight}
          isInvalidRange={isInvalidHeightRange}
          onMinChange={onFilterByMinHeightChange}
          onMaxChange={onFilterByMaxHeightChange}
        />
        <PokemonListSortControl checked={isSortedByHeight} onChange={onSortChange} />
      </div>
    </fieldset>
  );
};

export default PokemonListControls;
