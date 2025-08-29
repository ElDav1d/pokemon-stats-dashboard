import { renderHook, act } from "@testing-library/react";
import { useVirtualGridList } from "../useVirtualGridList";
import { it, expect, beforeEach, afterEach } from "vitest";

const mockItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

// Mock window properties for desktop viewport (≥768px = 5 columns)
const mockWindow = {
  scrollY: 0,
  innerWidth: 1024, // Desktop width
  innerHeight: 768,
};

beforeEach(() => {
  // Mock window properties for desktop
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

it("should use 5 columns on desktop viewport", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // With 100 items and 5 columns, we have 20 rows
  // Each row: itemHeight (50) + gap (10) = 60px
  // Total: 20 rows * 60px - final gap = 1200 - 10 = 1190px
  expect(result.current.totalHeight).toBe(1190);
});

it("should calculate correct item positions for 5-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 15), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // Test first row (items 0-4)
  expect(visibleItems[0].offsetY).toBe(0); // Row 0
  expect(visibleItems[1].offsetY).toBe(0); // Row 0
  expect(visibleItems[4].offsetY).toBe(0); // Row 0, last column

  // Test second row (items 5-9)
  expect(visibleItems[5].offsetY).toBe(120); // Row 1: (100 + 20) * 1
  expect(visibleItems[9].offsetY).toBe(120); // Row 1, last column

  // Test third row (items 10-14)
  expect(visibleItems[10].offsetY).toBe(240); // Row 2: (100 + 20) * 2
});

it("should calculate correct item widths for 5-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 5), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // With 5 columns and 20px gap, width calculation:
  // calc(20% - 16px) where 16px = ((5-1) * 20) / 5
  expect(visibleItems[0].width).toBe("calc(20% - 16px)");
  expect(visibleItems[4].width).toBe("calc(20% - 16px)");
});

it("should calculate correct offsetX for each column in 5-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 5), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // Test offsetX for each column
  expect(visibleItems[0].offsetX).toBe("calc(0% + 0px)"); // Column 0
  expect(visibleItems[1].offsetX).toBe("calc(20% + 20px)"); // Column 1
  expect(visibleItems[2].offsetX).toBe("calc(40% + 40px)"); // Column 2
  expect(visibleItems[3].offsetX).toBe("calc(60% + 60px)"); // Column 3
  expect(visibleItems[4].offsetX).toBe("calc(80% + 80px)"); // Column 4
});

it("should maintain 5 columns when resizing within desktop range", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  const initialHeight = result.current.totalHeight;

  act(() => {
    // Resize to larger desktop width (still ≥768px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1920,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should remain the same (still 5 columns)
  expect(result.current.totalHeight).toBe(initialHeight);
});

it("should switch from 5 to 3 columns when resizing to tablet", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  const desktopHeight = result.current.totalHeight; // 5 columns = 1190px

  act(() => {
    // Resize to tablet width (640px-767px = 3 columns)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 700,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should increase (fewer columns = more rows)
  // 100 items ÷ 3 columns = 34 rows (33.33 rounded up)
  // 34 rows * 60px - 10px = 2030px
  expect(result.current.totalHeight).toBe(2030);
  expect(result.current.totalHeight).toBeGreaterThan(desktopHeight);
});

it("should render correct visible items for desktop scroll behavior", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 100, overscan: 1, gap: 10 })
  );

  act(() => {
    // Scroll to show second and third rows
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 220, // Past first row (110px) into second row
    });
    window.dispatchEvent(new Event("scroll"));
  });

  const visibleItems = result.current.visibleItems;
  expect(visibleItems.length).toBeGreaterThan(0);

  // Should include items from visible rows plus overscan
  const minExpectedIndex = 5; // Start of second row (5 columns per row)
  const hasItemsFromSecondRow = visibleItems.some(
    (vi) => vi.index >= minExpectedIndex
  );
  expect(hasItemsFromSecondRow).toBe(true);
});
