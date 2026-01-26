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
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Evolutions:
      </h2>
      <PokemonEvolutionsList evolutions={evolutions} />
    </>
  );
};

export default PokemonEvolutions;
