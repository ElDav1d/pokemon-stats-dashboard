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
  const visibleIndices = result.current.visibleItems.map((item) => item.index);

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

  const visibleIndices = result.current.visibleItems.map((item) => item.index);

  // Should include items around row 10 (indices 50-54 for row 11)
  // With overscan, should include rows 8-13 approximately
  const expectedStartIndex = Math.max(0, (10 - 2) * 5); // Row 8
  const expectedEndIndex = Math.min(100, (10 + 5) * 5); // Row 15

  expect(visibleIndices[0]).toBeGreaterThanOrEqual(expectedStartIndex - 10);
  expect(visibleIndices[visibleIndices.length - 1]).toBeLessThanOrEqual(
    expectedEndIndex + 10
  );
});
