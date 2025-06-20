import { Link } from "react-router";
import { paths } from "../../lib/constants";
import { PokemonItem } from "./entities";

export interface IPokemonListItemProps {
  pokemon: PokemonItem;
  height: number;
}

const PokemonListItem = ({ pokemon, height }: IPokemonListItemProps) => {
  return (
    <li key={pokemon.name}>
      <Link to={`${paths.BASE}${pokemon.name}`}>
        <h3>{pokemon.name}</h3>
        <p>{height}</p>
      </Link>
    </li>
  );
};
export default PokemonListItem;
