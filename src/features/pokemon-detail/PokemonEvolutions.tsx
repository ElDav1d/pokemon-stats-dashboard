import { useEffect, useState } from "react";
import { Link } from "react-router";
import { paths } from "../../lib/constants";
import { IEvolutionChainLink } from "./entities";

interface IPokemonEvolutionsProps {
  evolutionChainUrl: string | null;
  currentName: string;
}

const PokemonEvolutions = ({
  evolutionChainUrl,
  currentName,
}: IPokemonEvolutionsProps) => {
  const [evolutionChain, setEvolutionChain] = useState<string[]>([]);

  useEffect(() => {
    if (!evolutionChainUrl) return;

    const getEvolutionNames = (chain: IEvolutionChainLink): string[] =>
      chain
        ? [chain.species.name, ...chain.evolves_to.flatMap(getEvolutionNames)]
        : [];

    const fetchEvolutionChain = async (url: string) => {
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

  if (!evolutionChainUrl || evolutionChain.length === 0) return null;

  return (
    <>
      <h2>Evolutions</h2>
      <ul>
        {evolutionChain.map(
          (evolution) =>
            evolution !== currentName && (
              <li key={evolution}>
                <Link to={`${paths.BASE}${evolution}`}>{evolution}</Link>
              </li>
            )
        )}
      </ul>
    </>
  );
};

export default PokemonEvolutions;
