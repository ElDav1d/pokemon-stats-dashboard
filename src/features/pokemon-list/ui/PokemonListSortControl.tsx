interface PokemonListSortControlProps {
  checked: boolean;
  onChange: () => void;
}

const PokemonListSortControl = ({ checked, onChange }: PokemonListSortControlProps) => {
  return (
    <>
      <input
        className="mr-2"
        type="checkbox"
        id="height"
        name="height"
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor="height">By height</label>
    </>
  );
};

export default PokemonListSortControl;
