import { useEffect } from "react";
import { PokemonStat } from "../../../domain/value-objects/PokemonStat";
import { renderStatsChart } from "../../d3/renderStatsChart";
import { graphConfig } from "../../../../../lib/constants";

export const useStatsGraph = (
  ref: React.RefObject<SVGSVGElement | null>,
  stats: PokemonStat[]
): void => {
  useEffect(() => {
    if (!ref.current) return;

    renderStatsChart(ref.current, stats, {
      width: graphConfig.WIDTH,
      height: graphConfig.HEIGHT,
      margin: {
        top: graphConfig.MARGIN_TOP,
        right: graphConfig.MARGIN_RIGHT,
        bottom: graphConfig.MARGIN_BOTTOM,
        left: graphConfig.MARGIN_LEFT,
      },
      barColor: "#60a5fa",
      animationDuration: 800,
    });
  }, [ref, stats]);
};
