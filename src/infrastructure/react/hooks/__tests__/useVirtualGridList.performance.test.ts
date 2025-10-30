import { renderHook } from "@testing-library/react";
import { useVirtualGridList } from "../useVirtualGridList";
import { it, expect, beforeEach, afterEach, describe } from "vitest";
import { ResponsiveBreakpoints } from "../../../virtualization/VirtualGridCalculator";

// Test breakpoints
const testBreakpoints: ResponsiveBreakpoints = {
  desktopMinWidth: 768,
  tabletMinWidth: 640,
  desktopColumns: 5,
  tabletColumns: 3,
  mobileColumns: 2,
};

// Mock window properties
const mockWindow = {
  scrollY: 0,
  innerWidth: 1024,
  innerHeight: 768,
};

beforeEach(() => {
  Object.defineProperty(window, "scrollY", {
    writable: true,
    configurable: true,
    value: mockWindow.scrollY,
  });
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: mockWindow.innerWidth,
  });
  Object.defineProperty(window, "innerHeight", {
    writable: true,
    configurable: true,
    value: mockWindow.innerHeight,
  });
});

afterEach(() => {
  mockWindow.scrollY = 0;
  mockWindow.innerWidth = 1024;
  mockWindow.innerHeight = 768;
});

describe("Performance with Large Datasets", () => {
  it("handles 1,000 items without performance degradation", () => {
    const largeDataset = Array.from({ length: 1000 }, (_, index) => ({
      id: index + 1,
      name: `Pokemon ${index + 1}`,
    }));

    const startTime = performance.now();

    const { result } = renderHook(() =>
      useVirtualGridList(largeDataset, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          overscan: 2,
          gap: 16,
        },
      })
    );

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Verify only visible items are calculated (not all 1000)
    const viewport = 768; // innerHeight
    const rowHeight = 200 + 16; // itemHeight + gap
    const visibleRows = Math.ceil(viewport / rowHeight);
    const overscanRows = 2;
    const columns = 5; // desktop columns
    const expectedMaxItems = (visibleRows + overscanRows * 2) * columns;

    expect(result.current.visibleItems.length).toBeLessThan(
      expectedMaxItems + 10
    );
    expect(result.current.visibleItems.length).toBeGreaterThan(0);

    // Verify calculation is fast (< 100ms even on slow machines)
    expect(executionTime).toBeLessThan(100);

    // Verify total height is calculated correctly for all items
    const totalRows = Math.ceil(1000 / columns);
    const expectedTotalHeight = totalRows * rowHeight - 16; // Last row has no gap
    expect(result.current.totalHeight).toBe(expectedTotalHeight);
  });

  it("handles 10,000 items without performance degradation", () => {
    const veryLargeDataset = Array.from({ length: 10000 }, (_, index) => ({
      id: index + 1,
      name: `Pokemon ${index + 1}`,
    }));

    const startTime = performance.now();

    const { result } = renderHook(() =>
      useVirtualGridList(veryLargeDataset, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          overscan: 2,
          gap: 16,
        },
      })
    );

    const endTime = performance.now();
    const executionTime = endTime - startTime;

    // Only visible items should be calculated
    expect(result.current.visibleItems.length).toBeLessThan(100);
    expect(result.current.visibleItems.length).toBeGreaterThan(0);

    // Performance should remain fast even with 10k items
    expect(executionTime).toBeLessThan(150);

    // Total height should be calculated correctly
    const columns = 5;
    const totalRows = Math.ceil(10000 / columns);
    const rowHeight = 200 + 16;
    const expectedTotalHeight = totalRows * rowHeight - 16;
    expect(result.current.totalHeight).toBe(expectedTotalHeight);
  });

  it("handles rapid dataset size changes efficiently", () => {
    const { result, rerender } = renderHook(
      ({ items }) =>
        useVirtualGridList(items, {
          breakpoints: testBreakpoints,
          config: {
            itemHeight: 200,
            overscan: 2,
            gap: 16,
          },
        }),
      {
        initialProps: {
          items: Array.from({ length: 100 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
          })),
        },
      }
    );

    // Initial render with 100 items
    expect(result.current.visibleItems.length).toBeGreaterThan(0);
    const initial100Height = result.current.totalHeight;

    // Change to 1000 items
    rerender({
      items: Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      })),
    });

    expect(result.current.totalHeight).toBeGreaterThan(initial100Height);
    expect(result.current.visibleItems.length).toBeLessThan(100);

    // Change to 10 items
    rerender({
      items: Array.from({ length: 10 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
      })),
    });

    expect(result.current.totalHeight).toBeLessThan(initial100Height);
    expect(result.current.visibleItems.length).toBeLessThanOrEqual(10);
  });
});

describe("Viewport Calculations", () => {
  it("calculates correct total height for 100 items with 5 columns", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          overscan: 2,
          gap: 16,
        },
      })
    );

    // 100 items / 5 columns = 20 rows
    // Each row: 200px (itemHeight) + 16px (gap) = 216px
    // Total: 20 rows * 216px - 16px (last row has no gap) = 4304px
    const expectedTotalHeight = 20 * 216 - 16;
    expect(result.current.totalHeight).toBe(expectedTotalHeight);
  });

  it("calculates correct visible range at scroll position 0", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          overscan: 2,
          gap: 16,
        },
      })
    );

    // At scroll 0, should show first row + overscan
    const visibleIndices = result.current.visibleItems.map(
      (item) => item.index
    );

    // Should start at index 0
    expect(visibleIndices[0]).toBe(0);

    // Should include first row (5 items) + overscan rows
    const viewport = 768;
    const rowHeight = 216;
    const visibleRows = Math.ceil(viewport / rowHeight);
    const overscanRows = 2;
    const expectedItemCount = (visibleRows + overscanRows * 2) * 5;

    expect(visibleIndices.length).toBeLessThanOrEqual(expectedItemCount);
  });

  it("calculates correct visible range at middle scroll position", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    const { result, rerender } = renderHook(
      () =>
        useVirtualGridList(items, {
          breakpoints: testBreakpoints,
          config: {
            itemHeight: 200,
            overscan: 2,
            gap: 16,
          },
        }),
      { initialProps: {} }
    );

    // Simulate scrolling to middle (row 10)
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 2160, // 10 rows * 216px
    });
    window.dispatchEvent(new Event("scroll"));

    rerender();

    const visibleIndices = result.current.visibleItems.map(
      (item) => item.index
    );

    // Should include items around row 10 (indices 50-54 for row 11)
    // With overscan, should include rows 8-13 approximately
    const expectedStartIndex = Math.max(0, (10 - 2) * 5); // Row 8
    const expectedEndIndex = Math.min(100, (10 + 5) * 5); // Row 15

    expect(visibleIndices[0]).toBeGreaterThanOrEqual(expectedStartIndex - 10);
    expect(visibleIndices[visibleIndices.length - 1]).toBeLessThanOrEqual(
      expectedEndIndex + 10
    );
  });
});

describe("Item Height and Width Calculations", () => {
  it("calculates correct item height from config", () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        config: {
          itemHeight: 250,
          gap: 20,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // First row items should be at offsetY: 0
    expect(visibleItems[0].offsetY).toBe(0);
    expect(visibleItems[1].offsetY).toBe(0);

    // Second row items should be at offsetY: itemHeight + gap
    const secondRowIndex = 5; // Default 5 columns
    if (visibleItems[secondRowIndex]) {
      expect(visibleItems[secondRowIndex].offsetY).toBe(250 + 20);
    }
  });

  it("calculates correct item width with 5 columns (desktop)", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    // Desktop viewport (1024px)
    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // With 5 columns and 16px gap:
    // Width = (100% / 5) - ((5-1) * 16px / 5)
    // Width = 20% - 12.8px
    // Rounded: calc(20% - 12.8px) or calc(20% - 13px)
    expect(visibleItems[0].width).toMatch(/calc\(20% - 1[23]\.?[0-9]*px\)/);
  });

  it("calculates correct item width with 3 columns (tablet)", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    // Tablet viewport (700px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 700,
    });

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // With 3 columns and 16px gap:
    // Width = (100% / 3) - ((3-1) * 16px / 3)
    // Width = 33.333% - 10.666px
    // JavaScript floating point may have many decimals
    expect(visibleItems[0].width).toContain("calc(33.333");
    expect(visibleItems[0].width).toContain("10.666");
  });

  it("calculates correct item width with 2 columns (mobile)", () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    // Mobile viewport (500px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // With 2 columns and 16px gap:
    // Width = (100% / 2) - ((2-1) * 16px / 2)
    // Width = 50% - 8px
    expect(visibleItems[0].width).toBe("calc(50% - 8px)");
  });
});

describe("Grid Column Count Adjustments", () => {
  it("uses 5 columns on desktop viewport (>= 768px)", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // Check that items 0-4 are in row 1 (offsetY: 0)
    // Check that items 5-9 are in row 2 (offsetY: 216)
    expect(visibleItems[0].offsetY).toBe(0);
    expect(visibleItems[4].offsetY).toBe(0);

    const row2Item = visibleItems.find((item) => item.index === 5);
    if (row2Item) {
      expect(row2Item.offsetY).toBe(216); // 200 + 16
    }
  });

  it("uses 3 columns on tablet viewport (640px - 767px)", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 700,
    });

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // Check that items 0-2 are in row 1 (offsetY: 0)
    // Check that items 3-5 are in row 2 (offsetY: 216)
    expect(visibleItems[0].offsetY).toBe(0);
    expect(visibleItems[2].offsetY).toBe(0);

    const row2Item = visibleItems.find((item) => item.index === 3);
    if (row2Item) {
      expect(row2Item.offsetY).toBe(216);
    }
  });

  it("uses 2 columns on mobile viewport (< 640px)", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    const visibleItems = result.current.visibleItems;

    // Check that items 0-1 are in row 1 (offsetY: 0)
    // Check that items 2-3 are in row 2 (offsetY: 216)
    expect(visibleItems[0].offsetY).toBe(0);
    expect(visibleItems[1].offsetY).toBe(0);

    const row2Item = visibleItems.find((item) => item.index === 2);
    if (row2Item) {
      expect(row2Item.offsetY).toBe(216);
    }
  });

  it("adjusts column count when viewport width changes", () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      name: `Item ${i}`,
    }));

    // Start with desktop
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result, rerender } = renderHook(() =>
      useVirtualGridList(items, {
        breakpoints: testBreakpoints,
        config: {
          itemHeight: 200,
          gap: 16,
          overscan: 1,
        },
      })
    );

    // Desktop: 5 columns
    const desktopVisibleItems = result.current.visibleItems;
    expect(desktopVisibleItems[4].offsetY).toBe(0); // Item 4 in first row

    // Change to tablet
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 700,
    });
    window.dispatchEvent(new Event("resize"));
    rerender();

    // Tablet: 3 columns
    const tabletVisibleItems = result.current.visibleItems;
    const tabletItem3 = tabletVisibleItems.find((item) => item.index === 3);
    if (tabletItem3) {
      expect(tabletItem3.offsetY).toBe(216); // Item 3 in second row
    }

    // Change to mobile
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.dispatchEvent(new Event("resize"));
    rerender();

    // Mobile: 2 columns
    const mobileVisibleItems = result.current.visibleItems;
    const mobileItem2 = mobileVisibleItems.find((item) => item.index === 2);
    if (mobileItem2) {
      expect(mobileItem2.offsetY).toBe(216); // Item 2 in second row
    }
  });
});
