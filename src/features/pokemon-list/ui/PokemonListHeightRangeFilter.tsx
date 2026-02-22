interface PokemonListHeightRangeFilterProps {
  minValue: number;
  maxValue: number;
  isInvalidRange: boolean;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}

const PokemonListHeightRangeFilter = ({
  minValue,
  maxValue,
  isInvalidRange,
  onMinChange,
  onMaxChange,
}: PokemonListHeightRangeFilterProps) => {
  return (
    <fieldset className="md:flex-none">
      <legend className="sr-only">Filter by height range</legend>
      <div className="flex items-center gap-2">
        <label htmlFor="filter-min-height" className="sr-only">
          Min height
        </label>
        <input
          type="number"
          id="filter-min-height"
          placeholder="Min"
          min="0"
          className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-gray-900"
          value={minValue || ""}
          onChange={(e) => onMinChange(Number(e.target.value))}
        />
        <span aria-hidden="true">–</span>
        <label htmlFor="filter-max-height" className="sr-only">
          Max height
        </label>
        <input
          type="number"
          id="filter-max-height"
          placeholder="Max"
          min="0"
          className="w-20 rounded-lg border border-stone-300 px-3 py-2 text-gray-900"
          value={maxValue || ""}
          onChange={(e) => onMaxChange(Number(e.target.value))}
        />
      </div>
      {isInvalidRange && (
        <p role="alert" className="text-sm text-red-600 mt-1">
          Min height cannot be greater than max height
        </p>
      )}
    </fieldset>
  );
};

export default PokemonListHeightRangeFilter;
