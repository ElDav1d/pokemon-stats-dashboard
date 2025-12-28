import * as d3 from "d3";
import { PokemonStat } from "../../domain/value-objects/PokemonStat";

export interface StatsChartConfig {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  barColor: string;
  animationDuration: number;
}

export const DEFAULT_STATS_CHART_CONFIG: StatsChartConfig = {
  width: 500,
  height: 300,
  margin: { top: 20, right: 30, bottom: 40, left: 90 },
  barColor: "#60a5fa",
  animationDuration: 800,
};

export function renderStatsChart(
  svgElement: SVGSVGElement,
  stats: PokemonStat[],
  config: StatsChartConfig = DEFAULT_STATS_CHART_CONFIG
): void {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const chartWidth = config.width - config.margin.left - config.margin.right;
  const chartHeight = config.height - config.margin.top - config.margin.bottom;

  const y = d3
    .scaleBand()
    .domain(stats.map((d) => d.name))
    .range([0, chartHeight])
    .padding(0.3);

  const x = d3
    .scaleLinear()
    .domain([0, d3.max(stats, (d) => d.baseStat)!])
    .nice()
    .range([0, chartWidth]);

  const chartGroup = svg
    .append("g")
    .attr("transform", `translate(${config.margin.left},${config.margin.top})`);

  chartGroup
    .selectAll("rect")
    .data(stats)
    .join("rect")
    .attr("y", (d) => y(d.name)!)
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", 0)
    .attr("fill", config.barColor)
    .transition()
    .duration(config.animationDuration)
    .attr("width", (d) => x(d.baseStat));

  chartGroup
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(5));

  chartGroup
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", "0.85rem")
    .style("text-transform", "capitalize");
}
