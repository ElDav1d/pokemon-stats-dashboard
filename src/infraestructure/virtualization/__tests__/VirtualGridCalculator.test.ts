import { describe, it, expect } from "vitest";
import { VirtualGridCalculator } from "../VirtualGridCalculator";

const mockItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

describe("VirtualGridCalculator (Framework Independent)", () => {
  it("should calculate total height correctly", () => {
    const calculator = new VirtualGridCalculator(mockItems, {
      itemHeight: 50,
      gap: 10,
      overscan: 2,
      columns: 5,
      viewportHeight: 600,
      scrollTop: 0,
    });

    // With 100 items, 5 columns = 20 rows
    // Each row: itemHeight (50) + gap (10) = 60px
    // Total: 20 rows * 60px - final gap = 1200 - 10 = 1190px
    expect(calculator.calculateTotalHeight()).toBe(1190);
  });

  it("should calculate visible range correctly", () => {
    const calculator = new VirtualGridCalculator(mockItems, {
      itemHeight: 100,
      gap: 16,
      overscan: 1,
      columns: 5,
      viewportHeight: 600,
      scrollTop: 200,
    });

    const range = calculator.calculateVisibleRange();
    expect(range.startIndex).toBeGreaterThanOrEqual(0);
    expect(range.endIndex).toBeLessThanOrEqual(mockItems.length);
    expect(range.startIndex).toBeLessThan(range.endIndex);
  });

  it("should calculate item position correctly", () => {
    const calculator = new VirtualGridCalculator(mockItems, {
      itemHeight: 100,
      gap: 16,
      overscan: 1,
      columns: 3,
      viewportHeight: 600,
      scrollTop: 0,
    });

    // Test first item (index 0) - should be at row 0, col 0
    const position0 = calculator.calculateItemPosition(0);
    expect(position0.offsetY).toBe(0);
    expect(position0.offsetX).toContain("0%");

    // Test fourth item (index 3) - should be at row 1, col 0
    const position3 = calculator.calculateItemPosition(3);
    expect(position3.offsetY).toBe(116); // (100 + 16) = 116px for row 1
  });

  it("should handle empty items array", () => {
    const calculator = new VirtualGridCalculator([], {
      itemHeight: 50,
      gap: 10,
      overscan: 2,
      columns: 5,
      viewportHeight: 600,
      scrollTop: 0,
    });

    expect(calculator.calculateTotalHeight()).toBe(0);
    expect(calculator.getVisibleItems()).toEqual([]);
    expect(calculator.calculateVisibleRange()).toEqual({ startIndex: 0, endIndex: 0 });
  });

  it("should calculate columns correctly", () => {
    expect(VirtualGridCalculator.calculateColumns(1024)).toBe(5); // Desktop
    expect(VirtualGridCalculator.calculateColumns(700)).toBe(3);  // Tablet
    expect(VirtualGridCalculator.calculateColumns(500)).toBe(2);  // Mobile
  });

  it("should get visible items with correct structure", () => {
    const calculator = new VirtualGridCalculator(mockItems.slice(0, 10), {
      itemHeight: 100,
      gap: 16,
      overscan: 0,
      columns: 2,
      viewportHeight: 300,
      scrollTop: 0,
    });

    const visibleItems = calculator.getVisibleItems();
    
    expect(visibleItems.length).toBeGreaterThan(0);
    expect(visibleItems[0]).toHaveProperty('item');
    expect(visibleItems[0]).toHaveProperty('index');
    expect(visibleItems[0]).toHaveProperty('offsetY');
    expect(visibleItems[0]).toHaveProperty('offsetX');
    expect(visibleItems[0]).toHaveProperty('width');
    expect(visibleItems[0].item).toEqual(mockItems[0]);
  });
});
