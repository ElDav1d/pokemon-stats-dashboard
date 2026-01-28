import { SubHeading } from "../../../ui";
import PokemonEvolutionsList from "./PokemonEvolutionsList";
interface PokemonEvolutionsProps {
  evolutions: string[];
}

const PokemonEvolutions = ({ evolutions }: PokemonEvolutionsProps) => {
  if (evolutions.length === 0) {
    return null;
  }

  return (
    <>
      <SubHeading title="Evolutions:" />
      <PokemonEvolutionsList evolutions={evolutions} />
    </>
  );
};

export default PokemonEvolutions;
