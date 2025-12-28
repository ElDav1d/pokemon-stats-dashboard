import { Link } from "react-router-dom";
import { paths } from "../../../lib/constants";

interface PokemonEvolutionsProps {
  evolutions: string[];
}

const PokemonEvolutions = ({ evolutions }: PokemonEvolutionsProps) => {
  if (evolutions.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Evolutions:
      </h2>
      <ul aria-live="polite" className="inline-flex gap-4 mb-4">
        {evolutions.map((evolution) => (
          <li
            key={evolution}
            className="capitalize bg-stone-200 rounded-lg p-2"
          >
            <Link
              className="text-blue-500 hover:underline"
              to={`${paths.BASE}${evolution}`}
            >
              {evolution}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default PokemonEvolutions;
