import { renderHook } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import { useStatsGraph } from "../useStatsGraph";
import { PokemonStat } from "../../../../domain/value-objects/PokemonStat";
import * as d3Adapter from "../../../d3/renderStatsChart";

vi.mock("../../../d3/renderStatsChart");

beforeEach(() => {
  vi.clearAllMocks();
});

it("calls renderStatsChart when ref is available", () => {
  const mockSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const mockRef = { current: mockSvgElement };
  const stats = [new PokemonStat("hp", 45, 0)];

  renderHook(() => useStatsGraph(mockRef, stats));

  expect(d3Adapter.renderStatsChart).toHaveBeenCalledWith(
    mockSvgElement,
    stats,
    expect.objectContaining({
      width: expect.any(Number),
      height: expect.any(Number),
    })
  );
});

it("does not call renderStatsChart when ref is null", () => {
  const mockRef = { current: null };
  const stats = [new PokemonStat("hp", 45, 0)];

  renderHook(() => useStatsGraph(mockRef, stats));

  expect(d3Adapter.renderStatsChart).not.toHaveBeenCalled();
});

it("re-renders chart when stats change", () => {
  const mockSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const mockRef = { current: mockSvgElement };
  const stats1 = [new PokemonStat("hp", 45, 0)];
  const stats2 = [new PokemonStat("hp", 45, 0), new PokemonStat("attack", 49, 0)];

  const { rerender } = renderHook(
    ({ stats }) => useStatsGraph(mockRef, stats),
    { initialProps: { stats: stats1 } }
  );

  expect(d3Adapter.renderStatsChart).toHaveBeenCalledTimes(1);

  rerender({ stats: stats2 });

  expect(d3Adapter.renderStatsChart).toHaveBeenCalledTimes(2);
});
