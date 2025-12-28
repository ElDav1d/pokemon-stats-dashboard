import { useEffect } from "react";
import * as d3 from "d3";
import { graphConfig } from "../../../lib/constants";

interface StatForGraph {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
  };
}

export const useStatsGraph = (
  ref: React.RefObject<SVGSVGElement | null>,
  stats: StatForGraph[]
) => {
  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const innerWidth = graphConfig.WIDTH;
    const innerHeight = graphConfig.HEIGHT;
    const margin = {
      top: graphConfig.MARGIN_TOP,
      right: graphConfig.MARGIN_RIGHT,
      bottom: graphConfig.MARGIN_BOTTOM,
      left: graphConfig.MARGIN_LEFT,
    };

    const chartWidth = innerWidth - margin.left - margin.right;
    const chartHeight = innerHeight - margin.top - margin.bottom;

    const y = d3
      .scaleBand()
      .domain(stats.map((d) => d.stat.name))
      .range([0, chartHeight])
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(stats, (d) => d.base_stat)!])
      .nice()
      .range([0, chartWidth]);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chartGroup
      .selectAll("rect")
      .data(stats)
      .join("rect")
      .attr("y", (d) => y(d.stat.name)!)
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", "#60a5fa")
      .transition()
      .duration(800)
      .attr("width", (d) => x(d.base_stat));

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
  }, [ref, stats]);
};
