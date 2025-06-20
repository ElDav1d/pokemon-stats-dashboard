import { useState, useEffect } from "react";
import { url } from "../../lib/constants";
import { IPokemonDetail } from "../../shared/entities";
import PokemonEvolutions from "./PokemonEvolutions";

const PokemonDetail = ({ name }: { name: string }) => {
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonDetail | null>(
    null
  );
  const [evolutionChainUrl, setEvolutionChainUrl] = useState<string>(null);

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
        <section>
          <img
            src={pokemonDetails.sprites.front_default}
            alt={pokemonDetails.name}
          />

          {evolutionChainUrl && (
            <PokemonEvolutions
              evolutionChainUrl={evolutionChainUrl}
              currentName={pokemonDetails.name}
            />
          )}

          <h2>Stats</h2>
          <ul>
            {pokemonDetails.stats.map((stat) => (
              <li key={stat.stat.name}>
                {stat.stat.name}: {stat.base_stat}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
};

export default PokemonDetail;
