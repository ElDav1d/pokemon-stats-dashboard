import { renderHook } from "@testing-library/react";
import { useVirtualGridList } from "../useVirtualGridList";
import { it, expect, beforeEach, afterEach } from "vitest";
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
