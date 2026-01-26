const PokemonStatsGraph = ({
  svgRef,
}: {
  svgRef: React.RefObject<SVGSVGElement | null>;
}) => (
  // TODO: graph svg accessibility
  // must have a image role and a11y title/desc
  // must receive stats in order to generate a11y description or whatever is needed for screen readers to understand the graph content
  <div className="w-full lg:w-2/3 xl:w-1/2 bg-stone-200 rounded-lg p-4 mb-4 text-stone-800">
    <svg
      ref={svgRef}
      viewBox="0 0 500 300"
      preserveAspectRatio="xMinYMin meet"
      className="w-full h-auto rounded"
    />
  </div>
);

export default PokemonStatsGraph;
