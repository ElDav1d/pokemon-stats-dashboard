import { Link } from "react-router-dom";
import { paths } from "../../lib/constants";
import { PokemonItem } from "./domain/entities/entities";

export interface IPokemonListItemProps {
  pokemon: PokemonItem;
  height: number;
  imageUrl: string;
}

const PokemonListItem = ({
  pokemon,
  height,
  imageUrl,
}: IPokemonListItemProps) => {
  return (
    <li
      key={pokemon.name}
      className="bg-stone-600  hover:bg-stone-400  rounded-lg p-4 animate duration-300 ease-in-out transform hover:scale-105"
    >
      <Link
        to={`${paths.BASE}${pokemon.name}`}
        className="text-white flex flex-col items-center gap-2"
      >
        <img
          src={imageUrl}
          alt={pokemon.name}
          loading="lazy"
          className="w-auto"
        />
        <h3 className="text-lg font-semibold capitalize">{pokemon.name}</h3>
        <p>Height: {height}</p>
      </Link>
    </li>
  );
};
export default PokemonListItem;
