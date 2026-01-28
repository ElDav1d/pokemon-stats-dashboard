const PokemonDetailTypesPokemonList = ({
  pokemonNames,
}: {
  pokemonNames: string[];
}) => (
  <ul className="flex flex-wrap gap-2 mb-2 mt-4" aria-live="polite">
    {pokemonNames.map((name) => (
      <li className="capitalize" key={name}>
        {name}
      </li>
    ))}
  </ul>
);

export default PokemonDetailTypesPokemonList;
