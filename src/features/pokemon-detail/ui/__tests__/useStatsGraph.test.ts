import { renderHook } from "@testing-library/react";
import { vi, it, expect, beforeEach, describe } from "vitest";
import * as d3Module from "d3";
import { useStatsGraph } from "../useStatsGraph";

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

    mockAxisBottom = vi.fn().mockReturnValue({
      ticks: vi.fn().mockReturnValue({}),
    });

    mockAxisLeft = vi.fn().mockReturnValue({
      selectAll: vi.fn().mockReturnThis(),
      style: vi.fn().mockReturnThis(),
    });

    vi.mocked(d3Module.select).mockReturnValue(mockSvg as any);
    vi.mocked(d3Module.scaleBand).mockImplementation(mockScaleBand);
    vi.mocked(d3Module.scaleLinear).mockImplementation(mockScaleLinear);
    (vi.mocked(d3Module.max) as any).mockImplementation(
      (
        arr: Array<{ base_stat: number }>,
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
      { base_stat: 45, effort: 0, stat: { name: "hp" } },
      { base_stat: 49, effort: 0, stat: { name: "attack" } },
      { base_stat: 50, effort: 0, stat: { name: "defense" } },
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleBandCall = vi.mocked(d3Module.scaleBand).mock.results[0].value;
    const domainCall = scaleBandCall.domain.mock.calls[0][0];

    expect(domainCall).toEqual(["hp", "attack", "defense"]);
  });

  it("calls d3.max with accessor that extracts base_stat", () => {
    const stats = [
      { base_stat: 45, effort: 0, stat: { name: "hp" } },
      { base_stat: 100, effort: 0, stat: { name: "attack" } },
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const maxCall = vi.mocked(d3Module.max).mock.calls[0];
    const accessor = maxCall[1] as any;

    expect(accessor({ base_stat: 100, effort: 0, stat: { name: "hp" } })).toBe(
      100
    );
    expect(
      accessor({ base_stat: 45, effort: 0, stat: { name: "attack" } })
    ).toBe(45);
  });

  it("sets scaleLinear domain with [0, maxStat] calculated from data", () => {
    const stats = [
      { base_stat: 10, effort: 0, stat: { name: "low" } },
      { base_stat: 200, effort: 0, stat: { name: "high" } },
      { base_stat: 50, effort: 0, stat: { name: "mid" } },
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleLinearCall = vi.mocked(d3Module.scaleLinear).mock.results[0]
      .value;
    const domainCall = scaleLinearCall.domain.mock.calls[0][0];

    expect(domainCall[0]).toBe(0);
    expect(domainCall[1]).toBe(200);
  });

  it("applies transition with 800ms duration to bar rectangles", () => {
    const stats = [{ base_stat: 45, effort: 0, stat: { name: "hp" } }];

    renderHook(() => useStatsGraph(mockRef, stats));

    expect(mockChartGroup.transition).toHaveBeenCalled();
    expect(mockChartGroup.duration).toHaveBeenCalledWith(800);
  });

  it("configures scaleBand with 0.3 padding", () => {
    const stats = [{ base_stat: 45, effort: 0, stat: { name: "hp" } }];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleBandCall = vi.mocked(d3Module.scaleBand).mock.results[0].value;
    expect(scaleBandCall.padding).toHaveBeenCalledWith(0.3);
  });

  it("re-executes chart when stats array changes", () => {
    const stats1 = [{ base_stat: 45, effort: 0, stat: { name: "hp" } }];
    const stats2 = [
      { base_stat: 45, effort: 0, stat: { name: "hp" } },
      { base_stat: 49, effort: 0, stat: { name: "attack" } },
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

  it("handles single stat correctly by extracting base_stat value", () => {
    const stats = [{ base_stat: 100, effort: 1, stat: { name: "speed" } }];

    renderHook(() => useStatsGraph(mockRef, stats));

    const maxCall = vi.mocked(d3Module.max).mock.calls[0];
    const accessor = maxCall[1] as any;

    expect(accessor(stats[0])).toBe(100);
  });

  it("calculates domain correctly with extreme stat values", () => {
    const stats = [
      { base_stat: 1, effort: 0, stat: { name: "low" } },
      { base_stat: 255, effort: 3, stat: { name: "high" } },
    ];

    renderHook(() => useStatsGraph(mockRef, stats));

    const scaleLinearCall = vi.mocked(d3Module.scaleLinear).mock.results[0]
      .value;
    const domainCall = scaleLinearCall.domain.mock.calls[0][0];

    expect(domainCall[0]).toBe(0);
    expect(domainCall[1]).toBe(255);
  });

  it("removes previous chart content before rendering new one", () => {
    const stats = [{ base_stat: 45, effort: 0, stat: { name: "hp" } }];

    renderHook(() => useStatsGraph(mockRef, stats));

    expect(mockSvg.selectAll).toHaveBeenCalledWith("*");
    expect(mockSvg.remove).toHaveBeenCalled();
  });
});
