import { it, expect, vi, beforeEach } from "vitest";
import * as d3Module from "d3";
import { renderStatsChart, type StatsChartConfig } from "../renderStatsChart";
import { PokemonStat } from "../../../domain/value-objects/PokemonStat";

vi.mock("d3");

const testConfig: StatsChartConfig = {
  width: 500,
  height: 300,
  margin: { top: 20, right: 30, bottom: 40, left: 90 },
  barColor: "#60a5fa",
  animationDurationMs: 800,
  axisFontSize: "0.85rem",
  scalePadding: 0.3,
  axisTicks: 5,
};

let mockSvgElement: SVGSVGElement;
let mockSvg: any;
let mockChartGroup: any;
let mockScaleBand: any;
let mockScaleLinear: any;

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
    selectAll: vi.fn().mockReturnThis(),
    remove: vi.fn().mockReturnThis(),
    append: vi.fn().mockReturnValue(mockChartGroup),
  };

  mockScaleBand = {
    domain: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    padding: vi.fn().mockReturnThis(),
    bandwidth: vi.fn().mockReturnValue(40),
  };

  mockScaleLinear = {
    domain: vi.fn().mockReturnThis(),
    nice: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
  };

  vi.mocked(d3Module.select).mockReturnValue(mockSvg as any);
  vi.mocked(d3Module.scaleBand).mockReturnValue(mockScaleBand as any);
  vi.mocked(d3Module.scaleLinear).mockReturnValue(mockScaleLinear as any);
  (vi.mocked(d3Module.max) as any).mockImplementation(
    (
      arr: Array<any>,
      accessor: (d: any, i?: number, a?: any[]) => number
    ) => {
      const values = arr.map(accessor);
      return Math.max(...values);
    }
  );
  vi.mocked(d3Module.axisBottom).mockReturnValue({ ticks: vi.fn().mockReturnThis() } as any);
  vi.mocked(d3Module.axisLeft).mockReturnValue(mockChartGroup as any);

  mockSvgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  vi.clearAllMocks();
});

it("clears previous chart content before rendering", () => {
  const stats = [new PokemonStat("hp", 45, 0)];

  renderStatsChart(mockSvgElement, stats, testConfig);

  expect(mockSvg.selectAll).toHaveBeenCalledWith("*");
  expect(mockSvg.remove).toHaveBeenCalled();
});

it("extracts stat names for scaleBand domain", () => {
  const stats = [
    new PokemonStat("hp", 45, 0),
    new PokemonStat("attack", 49, 0),
    new PokemonStat("defense", 50, 0),
  ];

  renderStatsChart(mockSvgElement, stats, testConfig);

  expect(mockScaleBand.domain).toHaveBeenCalledWith(["hp", "attack", "defense"]);
});

it("calculates max baseStat for scaleLinear domain", () => {
  const stats = [
    new PokemonStat("low", 10, 0),
    new PokemonStat("high", 200, 0),
    new PokemonStat("mid", 50, 0),
  ];

  renderStatsChart(mockSvgElement, stats, testConfig);

  expect(mockScaleLinear.domain).toHaveBeenCalledWith([0, 200]);
});

it("uses scale padding from config", () => {
  const stats = [new PokemonStat("hp", 45, 0)];
  const customConfig = {
    ...testConfig,
    scalePadding: 0.5,
  };

  renderStatsChart(mockSvgElement, stats, customConfig);

  expect(mockScaleBand.padding).toHaveBeenCalledWith(0.5);
});

it("applies transition with custom animation duration from config", () => {
  const stats = [new PokemonStat("hp", 45, 0)];
  const customConfig = {
    ...testConfig,
    animationDurationMs: 500,
  };

  renderStatsChart(mockSvgElement, stats, customConfig);

  expect(mockChartGroup.transition).toHaveBeenCalled();
  expect(mockChartGroup.duration).toHaveBeenCalledWith(500);
});

it("handles single stat correctly", () => {
  const stats = [new PokemonStat("speed", 100, 1)];

  renderStatsChart(mockSvgElement, stats, testConfig);

  expect(mockScaleBand.domain).toHaveBeenCalledWith(["speed"]);
  expect(mockScaleLinear.domain).toHaveBeenCalledWith([0, 100]);
});

it("handles extreme stat values (Pokemon max is 255)", () => {
  const stats = [
    new PokemonStat("low", 1, 0),
    new PokemonStat("max", 255, 3),
  ];

  renderStatsChart(mockSvgElement, stats, testConfig);

  expect(mockScaleLinear.domain).toHaveBeenCalledWith([0, 255]);
});
