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
  animationDurationMs: number;
  axisFontSize: string;
  scalePadding: number;
  axisTicks: number;
}

export function renderStatsChart(
  svgElement: SVGSVGElement,
  stats: PokemonStat[],
  config: StatsChartConfig
): void {
  const svg = d3.select(svgElement);
  svg.selectAll("*").remove();

  const chartWidth = config.width - config.margin.left - config.margin.right;
  const chartHeight = config.height - config.margin.top - config.margin.bottom;

  const y = d3
    .scaleBand()
    .domain(stats.map((d) => d.name))
    .range([0, chartHeight])
    .padding(config.scalePadding);

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
    .duration(config.animationDurationMs)
    .attr("width", (d) => x(d.baseStat));

  chartGroup
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(config.axisTicks));

  chartGroup
    .append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("font-size", config.axisFontSize)
    .style("text-transform", "capitalize");
}
