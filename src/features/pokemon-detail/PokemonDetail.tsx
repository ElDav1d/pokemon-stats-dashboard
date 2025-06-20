import { useState, useEffect } from "react";
import { url } from "../../lib/constants";
import { IPokemonDetail } from "../../shared/entities";

const PokemonDetail = ({ name }: { name: string }) => {
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonDetail | null>(
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
  return (
    <>
      {pokemonDetails && (
        <section>
          <img
            src={pokemonDetails.sprites.front_default}
            alt={pokemonDetails.name}
          />
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
