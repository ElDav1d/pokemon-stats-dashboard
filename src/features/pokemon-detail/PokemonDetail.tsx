import { useState, useEffect } from "react";
import { Link } from "react-router";
import { url, paths } from "../../lib/constants";
import { IPokemonDetail } from "../../shared/entities";

const PokemonDetail = ({ name }: { name: string }) => {
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonDetail | null>(
    null
  );
  const [evolutionChainUrl, setEvolutionChainUrl] = useState<string>(null);
  const [evolutionChain, setEvolutionChain] = useState<string[]>([]);

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

  useEffect(() => {
    if (!evolutionChainUrl) return;

    const getEvolutionNames = (chain) =>
      chain
        ? [chain.species.name, ...chain.evolves_to.flatMap(getEvolutionNames)]
        : [];

    const fetchEvolutionChain = async (url) => {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Failed to fetch evolution chain");
        }

        const data = await response.json();

        setEvolutionChain(getEvolutionNames(data.chain));
      } catch (error) {
        console.error("Error fetching evolution chain", error);
      }
    };

    fetchEvolutionChain(evolutionChainUrl);
  }, [evolutionChainUrl]);

  return (
    <>
      {pokemonDetails && (
        <section>
          <img
            src={pokemonDetails.sprites.front_default}
            alt={pokemonDetails.name}
          />

          {evolutionChain.length > 0 && (
            <>
              <h2>Evolutions</h2>
              <ul>
                {evolutionChain.map(
                  (evolution) =>
                    evolution !== name && (
                      <li key={evolution}>
                        <Link to={`${paths.BASE}${evolution}`}>
                          {evolution}
                        </Link>
                      </li>
                    )
                )}
              </ul>
            </>
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
