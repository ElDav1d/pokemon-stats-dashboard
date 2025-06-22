import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { Stat } from "../../shared/entities";
import { graphConfig } from "../../lib/constants";

interface IPokemonStatsProps {
  stats: Stat[];
}

const PokemonStats = ({ stats }: IPokemonStatsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
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
      .style("font-size", "0.85rem");
  }, [stats]);

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
