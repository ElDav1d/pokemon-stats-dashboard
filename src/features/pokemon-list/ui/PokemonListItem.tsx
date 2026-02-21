import { memo } from "react";
import { Link } from "react-router-dom";
import { paths } from "../../../lib/constants";

export interface IPokemonListItemProps {
  name: string;
  height: number;
  imageUrl: string;
}

const PokemonListItem = memo(
  ({ name, height, imageUrl }: IPokemonListItemProps) => {
    return (
      <Link
        to={`${paths.BASE}${name}`}
        className="h-full bg-stone-600 hover:bg-stone-400 rounded-lg p-4 animate duration-300 ease-in-out transform hover:scale-105 text-white flex flex-col items-center gap-2"
      >
        <div className="h-24 w-full flex items-center justify-center overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            loading="lazy"
            className="h-full w-auto object-contain"
          />
        </div>
        <h3 className="text-lg font-semibold capitalize truncate w-full text-center">
          {name}
        </h3>
        <p>Height: {height}</p>
      </Link>
    );
  }
);
export default PokemonListItem;
