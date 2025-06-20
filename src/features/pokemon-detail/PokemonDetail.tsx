import { useState, useEffect } from "react";
import { url } from "../../lib/constants";
import { IPokemonDetail } from "../../shared/entities";
import PokemonEvolutions from "./PokemonEvolutions";
import PokemonStats from "./PokemonStats";
import { IPokemonListItem } from "../pokemon-list/entities";

const PokemonDetail = ({ name }: { name: string }) => {
  const [pokemonDetails, setPokemonDetails] = useState<IPokemonDetail | null>(
    null
  );
  const [evolutionChainUrl, setEvolutionChainUrl] = useState<string | null>(
    null
  );
  const [selectedType, setSelectedType] = useState<{ type: string } | null>(
    null
  );
  const [pokemonList, setPokemonList] = useState<IPokemonListItem[]>([]);

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
    if (!selectedType) return;

    const fetchPokemonList = async (type: string) => {
      try {
        const response = await fetch(`${url.BASE}${url.TYPE}${type}`);

        if (!response.ok) {
          throw new Error("Failed to fetch pokemon list");
        }

        const data = await response.json();
        setPokemonList(data.pokemon);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
      }
    };

    fetchPokemonList(selectedType.type);
  }, [selectedType]);

  const selectType = (type: string) => {
    setSelectedType({ type });
  };

  return (
    <>
      {pokemonDetails && (
        <>
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

            {pokemonDetails.stats.length > 0 && (
              <PokemonStats stats={pokemonDetails.stats} />
            )}
          </section>
          {pokemonDetails.types.length > 0 && (
            <section>
              <h2>Types</h2>
              <ul className="flex gap-2 overflow-x-auto">
                {pokemonDetails.types.map((type) => (
                  <li key={type.type.name}>
                    <button onClick={() => selectType(type.type.name)}>
                      {type.type.name}
                    </button>
                  </li>
                ))}
              </ul>
              {pokemonList.length > 0 && (
                <ul>
                  {pokemonList.map(({ pokemon }) => (
                    <li key={pokemon.name}>{pokemon.name}</li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </>
  );
};

export default PokemonDetail;
