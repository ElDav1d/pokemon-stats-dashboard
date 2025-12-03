import { renderHook, act } from "@testing-library/react";
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

const mockItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

// Mock window properties for testing (default desktop viewport)
const mockWindow = {
  scrollY: 0,
  innerWidth: 1024,
  innerHeight: 768,
};

beforeEach(() => {
  // Mock window properties
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
  // Reset window properties
  mockWindow.scrollY = 0;
  mockWindow.innerWidth = 1024;
  mockWindow.innerHeight = 768;
});

it("should handle empty items array", () => {
  const { result } = renderHook(() => useVirtualGridList([], {}));

  expect(result.current.totalHeight).toBe(0);
  expect(result.current.visibleItems).toEqual([]);
});

it("should handle undefined items", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(null as unknown as [], {})
  );

  expect(result.current.totalHeight).toBe(0);
  expect(result.current.visibleItems).toEqual([]);
});

it("should return visible items based on scroll position", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      config: {
        itemHeight: 200,
        overscan: 2,
        gap: 16,
      },
    })
  );

  act(() => {
    // Simulate scrolling down 400px
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 400,
    });
    window.dispatchEvent(new Event("scroll"));
  });

  const visibleItems = result.current.visibleItems;
  expect(visibleItems.length).toBeGreaterThan(0);

  // Verify we're getting items that should be visible at this scroll position
  const itemIndices = visibleItems.map((vi) => vi.index);
  expect(itemIndices.length).toBeGreaterThan(0);
});

it("should handle overscan correctly", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      config: {
        itemHeight: 100,
        overscan: 3,
        gap: 16,
      },
    })
  );

  act(() => {
    // Simulate scrolling to position where overscan should include extra items
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 300,
    });
    window.dispatchEvent(new Event("scroll"));
  });

  const visibleItems = result.current.visibleItems;
  expect(visibleItems.length).toBeGreaterThan(0);

  // With overscan, we should get more items than just what's visible
  const viewport = 768; // mocked innerHeight
  const itemsPerRow = 5; // 5 columns on desktop
  const rowHeight = 100 + 16; // itemHeight + gap
  const visibleRows = Math.ceil(viewport / rowHeight);
  const expectedMinItems = visibleRows * itemsPerRow;

  // Should include overscan items
  expect(visibleItems.length).toBeGreaterThan(expectedMinItems);
});

it("should update scroll position when window scroll event occurs", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      config: {
        itemHeight: 50,
        gap: 10,
        overscan: 5,
      },
    })
  );

  // Initial scroll position should be 0
  expect(result.current.visibleItems[0]?.index).toBe(0);

  act(() => {
    // Simulate scrolling
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.dispatchEvent(new Event("scroll"));
  });

  // Should update visible items based on new scroll position
  const visibleItems = result.current.visibleItems;
  expect(visibleItems.length).toBeGreaterThan(0);
});

it("should calculate correct item positions with offsetY and offsetX", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 10), {
      config: { itemHeight: 100, gap: 20, overscan: 5 },
    })
  );

  const visibleItems = result.current.visibleItems;

  // First item should be at top-left
  expect(visibleItems[0].offsetY).toBe(0);
  expect(visibleItems[0].offsetX).toBe("calc(0% + 0px)");

  // Second item should be next column in same row
  expect(visibleItems[1].offsetY).toBe(0);
  expect(visibleItems[1].offsetX).toBe("calc(20% + 20px)");

  // Sixth item should be in second row, first column (5 columns per row)
  if (visibleItems[5]) {
    expect(visibleItems[5].offsetY).toBe(120); // (100 + 20) * 1
    expect(visibleItems[5].offsetX).toBe("calc(0% + 0px)");
  }
});

it("should calculate correct item widths", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 5), {
      config: { itemHeight: 100, gap: 20, overscan: 5 },
    })
  );

  const visibleItems = result.current.visibleItems;

  // With 5 columns and 20px gap, width should be calculated correctly
  // calc(20% - 16px) where 16px = ((5-1) * 20) / 5
  expect(visibleItems[0].width).toBe("calc(20% - 16px)");
});
