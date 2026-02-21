interface PokemonListSortControlProps {
  checked: boolean;
  onChange: () => void;
}

const PokemonListSortControl = ({ checked, onChange }: PokemonListSortControlProps) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
      <input
        type="checkbox"
        name="height"
        checked={checked}
        onChange={onChange}
      />
      <span>By height</span>
    </label>
  );
};

export default PokemonListSortControl;
