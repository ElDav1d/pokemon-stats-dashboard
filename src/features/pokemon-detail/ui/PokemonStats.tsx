import { useRef } from "react";
import { PokemonStat } from "../domain/value-objects/PokemonStat";
import { useStatsGraph } from "../infrastructure/react/hooks/useStatsGraph";
import PokemonStatsGraph from "./PokemonStatsGraph";
import { SubHeading } from "../../../ui";

interface PokemonStatsProps {
  stats: PokemonStat[];
}

const PokemonStats = ({ stats }: PokemonStatsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useStatsGraph(svgRef, stats);

  return (
    <>
      <SubHeading title="Stats:" />
      <PokemonStatsGraph svgRef={svgRef} />
    </>
  );
};

export default PokemonStats;
