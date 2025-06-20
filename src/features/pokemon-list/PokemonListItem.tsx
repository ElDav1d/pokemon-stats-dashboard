import { Link } from "react-router";
import { paths } from "../../lib/constants";
import { PokemonItem } from "./entities";

export interface IPokemonListItemProps {
  pokemon: PokemonItem;
}

const PokemonListItem = ({ pokemon }: IPokemonListItemProps) => {
  return (
    <li key={pokemon.name}>
      <Link to={`${paths.BASE}${pokemon.name}`}>
        <h3>{pokemon.name}</h3>
      </Link>
    </li>
  );
};
export default PokemonListItem;
