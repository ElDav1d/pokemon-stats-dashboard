import { useEffect } from "react";
import { PokemonStat } from "../../../domain/value-objects/PokemonStat";
import { STATS_CHART_CONFIG } from "../../../domain/constants";
import { renderStatsChart } from "../../d3/renderStatsChart";

export const useStatsGraph = (
  ref: React.RefObject<SVGSVGElement | null>,
  stats: PokemonStat[]
): void => {
  useEffect(() => {
    if (!ref.current) return;

    renderStatsChart(ref.current, stats, {
      width: STATS_CHART_CONFIG.WIDTH,
      height: STATS_CHART_CONFIG.HEIGHT,
      margin: {
        top: STATS_CHART_CONFIG.MARGIN.TOP,
        right: STATS_CHART_CONFIG.MARGIN.RIGHT,
        bottom: STATS_CHART_CONFIG.MARGIN.BOTTOM,
        left: STATS_CHART_CONFIG.MARGIN.LEFT,
      },
      barColor: STATS_CHART_CONFIG.BAR_COLOR,
      animationDurationMs: STATS_CHART_CONFIG.ANIMATION_DURATION_MS,
      axisFontSize: STATS_CHART_CONFIG.AXIS_FONT_SIZE,
      scalePadding: STATS_CHART_CONFIG.SCALE_PADDING,
      axisTicks: STATS_CHART_CONFIG.AXIS_TICKS,
    });
  }, [ref, stats]);
};
