interface PokemonListNameFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const PokemonListNameFilter = ({ value, onChange }: PokemonListNameFilterProps) => {
  return (
    <div>
      <label htmlFor="search-by-name">Search by name</label>
      <input
        className="ml-2 border text-gray-900"
        type="search"
        id="search-by-name"
        name="search-by-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default PokemonListNameFilter;
