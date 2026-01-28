import usePokemonDetail from "../infrastructure/react/hooks/usePokemonDetail";
import PokemonDetailTypes from "./PokemonDetailTypes";
import PokemonDetailData from "./PokemonDetailData";

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
      <PokemonDetailData
        imageUrl={pokemonDetail.imageUrl}
        name={pokemonDetail.name}
        evolutions={evolutions}
        stats={pokemonDetail.stats}
      />
      {pokemonDetail.types.length > 0 && (
        <PokemonDetailTypes types={pokemonDetail.types} />
      )}
    </>
  );
};

export default PokemonDetail;
