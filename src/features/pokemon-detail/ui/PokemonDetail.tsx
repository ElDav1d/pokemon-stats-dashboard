import usePokemonDetail from "../infrastructure/react/hooks/usePokemonDetail";
import PokemonEvolutions from "./PokemonEvolutions";
import PokemonStats from "./PokemonStats";

interface PokemonDetailProps {
  name: string;
}

const PokemonDetail = ({ name }: PokemonDetailProps) => {
  const { pokemonDetail, evolutions, isLoading, isError } =
    usePokemonDetail(name);

  if (isLoading) {
    return <p>Loading pokemon details...</p>;
  }

  if (isError) {
    return <p>Error loading pokemon details</p>;
  }

  if (!pokemonDetail) {
    return null;
  }

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row bg-stone-600 rounded-lg p-4 mb-4">
        <img
          className="w-full md:w-80 xl:w-86 object-contain"
          src={pokemonDetail.imageUrl}
          alt={pokemonDetail.name}
        />
        <div className="w-full">
          {evolutions.length > 0 && (
            <PokemonEvolutions evolutions={evolutions} />
          )}
          {pokemonDetail.stats.length > 0 && (
            <PokemonStats stats={pokemonDetail.stats} />
          )}
        </div>
      </section>

      {/* PokemonDetailTypes will be added after Phase 12 */}
    </>
  );
};

export default PokemonDetail;
