import { Link } from "react-router-dom";
import { paths } from "../../../lib/constants";

const PokemonEvolutionsList = ({ evolutions }: { evolutions: string[] }) => {
  if (evolutions.length === 0) {
    return null;
  }

  return (
    <ul aria-live="polite" className="inline-flex gap-4 mb-4">
      {evolutions.map((evolution) => (
        <li key={evolution} className="capitalize bg-stone-200 rounded-lg p-2">
          <Link
            className="text-blue-500 hover:underline"
            to={`${paths.BASE}${evolution}`}
          >
            {evolution}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default PokemonEvolutionsList;
