import { useRef } from "react";
import { PokemonStat } from "../domain/value-objects/PokemonStat";
import { useStatsGraph } from "../infrastructure/react/hooks/useStatsGraph";
import PokemonStatsGraph from "./PokemonStatsGraph";

interface PokemonStatsProps {
  stats: PokemonStat[];
}

const PokemonStats = ({ stats }: PokemonStatsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useStatsGraph(svgRef, stats);

  return (
    <>
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Stats:
      </h2>
      <PokemonStatsGraph svgRef={svgRef} />
    </>
  );
};

export default PokemonStats;
