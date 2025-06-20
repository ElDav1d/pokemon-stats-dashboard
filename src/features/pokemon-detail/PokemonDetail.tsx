import { useState, useEffect } from "react";
import { url } from "../../lib/constants";
import { IPokemonDetail } from "../../shared/entities";
import PokemonEvolutions from "./PokemonEvolutions";
import PokemonStats from "./PokemonStats";
import PokemonDetailTypes from "./PokemonDetailTypes";

const PokemonDetail = ({ name }: { name: string }) => {
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonDetail | null>(
    null
  );
  const [evolutionChainUrl, setEvolutionChainUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!name) return;

    const fetchPokemonDetails = async (pokemonName: string) => {
      if (!pokemonName) return;

      try {
        const response = await fetch(`${url.BASE}${url.POKEMON}${pokemonName}`);

        if (!response.ok) {
          throw new Error("Failed to fetch pokemon details");
        }
        const data = await response.json();

        setPokemonDetails(data);
      } catch (error) {
        console.error("Error fetching pokemon details:", error);
      }
    };

    fetchPokemonDetails(name);
  }, [name]);

  useEffect(() => {
    if (!pokemonDetails) return;

    const fetchEvolutionChainUrl = async (speciesUrl: string) => {
      try {
        const response = await fetch(speciesUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch species");
        }

        const data = await response.json();

        setEvolutionChainUrl(data.evolution_chain.url);
      } catch (error) {
        console.error("Error fetching species:", error);
      }
    };

    if (pokemonDetails?.species?.url) {
      fetchEvolutionChainUrl(pokemonDetails.species.url);
    }
  }, [pokemonDetails]);

  return (
    <>
      {pokemonDetails && (
        <>
          <section className="flex flex-col gap-4 md:flex-row bg-stone-600  rounded-lg p-4 mb-4">
            <img
              className="w-full md:w-80 xl:w-86 object-contain"
              src={pokemonDetails.sprites.front_default}
              alt={pokemonDetails.name}
            />
            <div className="w-full">
              {evolutionChainUrl && (
                <PokemonEvolutions
                  evolutionChainUrl={evolutionChainUrl}
                  currentName={pokemonDetails.name}
                />
              )}
              {pokemonDetails.stats.length > 0 && (
                <PokemonStats stats={pokemonDetails.stats} />
              )}
            </div>
          </section>

          {pokemonDetails?.types.length > 0 && (
            <PokemonDetailTypes types={pokemonDetails.types} />
          )}
        </>
      )}
    </>
  );
};

export default PokemonDetail;
