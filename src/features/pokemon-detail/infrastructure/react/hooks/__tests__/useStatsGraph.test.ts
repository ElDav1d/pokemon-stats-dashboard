import { renderHook } from "@testing-library/react";
import { vi, it, expect, beforeEach, describe } from "vitest";
import * as d3Module from "d3";
import { useStatsGraph } from "../useStatsGraph";
import { PokemonStat } from "../../../../domain/value-objects/PokemonStat";

vi.mock("d3");

describe("useStatsGraph", () => {
  let mockRef: React.RefObject<SVGSVGElement | null>;
  let mockSvg: any;
  let mockChartGroup: any;
  let mockScaleBand: any;
  let mockScaleLinear: any;
  let mockAxisBottom: any;
  let mockAxisLeft: any;

  beforeEach(() => {
    mockChartGroup = {
      selectAll: vi.fn().mockReturnThis(),
      data: vi.fn().mockReturnThis(),
      join: vi.fn().mockReturnThis(),
      attr: vi.fn().mockReturnThis(),
      transition: vi.fn().mockReturnThis(),
      duration: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnThis(),
      call: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
    };

    mockSvg = {
      select: vi.fn().mockReturnThis(),
      selectAll: vi.fn().mockReturnThis(),
      remove: vi.fn().mockReturnThis(),
      append: vi.fn().mockReturnValue(mockChartGroup),
    };

    mockScaleBand = vi.fn().mockReturnValue({
      domain: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      padding: vi.fn().mockReturnThis(),
      bandwidth: vi.fn().mockReturnValue(40),
    });

    mockScaleLinear = vi.fn().mockReturnValue({
      domain: vi.fn().mockReturnThis(),
      nice: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    });

    mockAxisBottom = {
      ticks: vi.fn().mockReturnThis(),
    };

    mockAxisLeft = {
      selectAll: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
    };

    vi.mocked(d3Module.select).mockReturnValue(mockSvg as any);
    vi.mocked(d3Module.scaleBand).mockImplementation(mockScaleBand);
    vi.mocked(d3Module.scaleLinear).mockImplementation(mockScaleLinear);
    (vi.mocked(d3Module.max) as any).mockImplementation(
      (
        arr: Array<any>,
        accessor: (d: any, i?: number, a?: any[]) => number
      ) => {
        const values = arr.map(accessor);
        return Math.max(...values);
      }
    );
    vi.mocked(d3Module.axisBottom).mockReturnValue(mockAxisBottom as any);
    vi.mocked(d3Module.axisLeft).mockReturnValue(mockAxisLeft as any);

    mockRef = {
      current: document.createElement("svg") as unknown as SVGSVGElement,
    };
    vi.clearAllMocks();
  });

  it("extracts stat names and passes them to scaleBand domain", () => {
    const stats = [
      new PokemonStat("hp", 45, 0),
      new PokemonStat("attack", 49, 0),
      new PokemonStat("defense", 50, 0),
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleBandCall = vi.mocked(d3Module.scaleBand).mock.results[0].value;
    const domainCall = scaleBandCall.domain.mock.calls[0][0];

    expect(domainCall).toEqual(["hp", "attack", "defense"]);
  });

  it("calls d3.max with accessor that extracts baseStat", () => {
    const stats = [
      new PokemonStat("hp", 45, 0),
      new PokemonStat("attack", 100, 0),
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const maxCall = vi.mocked(d3Module.max).mock.calls[0];
    const accessor = maxCall[1] as any;

    expect(accessor(new PokemonStat("hp", 100, 0))).toBe(100);
    expect(accessor(new PokemonStat("attack", 45, 0))).toBe(45);
  });

  it("sets scaleLinear domain with [0, maxStat] calculated from data", () => {
    const stats = [
      new PokemonStat("low", 10, 0),
      new PokemonStat("high", 200, 0),
      new PokemonStat("mid", 50, 0),
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleLinearCall = vi.mocked(d3Module.scaleLinear).mock.results[0]
      .value;
    const domainCall = scaleLinearCall.domain.mock.calls[0][0];

    expect(domainCall[0]).toBe(0);
    expect(domainCall[1]).toBe(200);
  });

  it("applies transition with 800ms duration to bar rectangles", () => {
    const stats = [new PokemonStat("hp", 45, 0)];

    renderHook(() => useStatsGraph(mockRef, stats));

    expect(mockChartGroup.transition).toHaveBeenCalled();
    expect(mockChartGroup.duration).toHaveBeenCalledWith(800);
  });

  it("configures scaleBand with 0.3 padding", () => {
    const stats = [new PokemonStat("hp", 45, 0)];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleBandCall = vi.mocked(d3Module.scaleBand).mock.results[0].value;
    expect(scaleBandCall.padding).toHaveBeenCalledWith(0.3);
  });

  it("re-executes chart when stats array changes", () => {
    const stats1 = [new PokemonStat("hp", 45, 0)];
    const stats2 = [
      new PokemonStat("hp", 45, 0),
      new PokemonStat("attack", 49, 0),
    ];

    const { rerender } = renderHook(
      ({ stats }) => useStatsGraph(mockRef, stats),
      { initialProps: { stats: stats1 } }
    );

    const firstCallCount = vi.mocked(d3Module.scaleBand).mock.calls.length;

    rerender({ stats: stats2 });

    expect(vi.mocked(d3Module.scaleBand).mock.calls.length).toBeGreaterThan(
      firstCallCount
    );
  });

  it("handles single stat correctly by extracting baseStat value", () => {
    const stats = [new PokemonStat("speed", 100, 1)];

    renderHook(() => useStatsGraph(mockRef, stats));

    const maxCall = vi.mocked(d3Module.max).mock.calls[0];
    const accessor = maxCall[1] as any;

    expect(accessor(stats[0])).toBe(100);
  });

  it("calculates domain correctly with extreme stat values", () => {
    const stats = [
      new PokemonStat("low", 1, 0),
      new PokemonStat("high", 255, 3),
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleLinearCall = vi.mocked(d3Module.scaleLinear).mock.results[0]
      .value;
    const domainCall = scaleLinearCall.domain.mock.calls[0][0];

    expect(domainCall[0]).toBe(0);
    expect(domainCall[1]).toBe(255);
  });

  it("removes previous chart content before rendering new one", () => {
    const stats = [new PokemonStat("hp", 45, 0)];

    renderHook(() => useStatsGraph(mockRef, stats));

    expect(mockSvg.selectAll).toHaveBeenCalledWith("*");
    expect(mockSvg.remove).toHaveBeenCalled();
  });
});
