import { useRef } from "react";
import { Stat } from "../../pages/Detail/entities";
import { useStatsGraph } from "./useStatsGraph";

interface IPokemonStatsProps {
  stats: Stat[];
}

const PokemonStats = ({ stats }: IPokemonStatsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useStatsGraph(svgRef, stats);

  return (
    <>
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Stats:
      </h2>
      <div className="w-full lg:w-2/3 xl:w-1/2 bg-stone-200 rounded-lg p-4 mb-4 text-stone-800">
        <svg
          ref={svgRef}
          viewBox="0 0 500 300"
          preserveAspectRatio="xMinYMin meet"
          className="w-full h-auto rounded"
        />
      </div>
    </>
  );
};

export default PokemonStats;
