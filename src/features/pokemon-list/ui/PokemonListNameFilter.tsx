interface PokemonListNameFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const PokemonListNameFilter = ({ value, onChange }: PokemonListNameFilterProps) => {
  return (
    <div className="flex-1">
      <label htmlFor="search-by-name" className="sr-only">
        Search by name
      </label>
      <input
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-gray-900"
        type="search"
        id="search-by-name"
        name="search-by-name"
        placeholder="Search by name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default PokemonListNameFilter;
