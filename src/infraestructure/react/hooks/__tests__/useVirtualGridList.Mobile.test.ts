import { renderHook, act } from "@testing-library/react";
import { useVirtualGridList } from "../useVirtualGridList";
import { it, expect, beforeEach, afterEach } from "vitest";
import { responsiveBreakpoints } from "../../../virtualization/VirtualGridCalculator";

const mockItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

// Mock window properties for mobile viewport (<640px = 2 columns)
const mockWindow = {
  scrollY: 0,
  innerWidth: 375, // Mobile width
  innerHeight: 667,
};

beforeEach(() => {
  // Mock window properties for mobile
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
  mockWindow.innerWidth = 375;
  mockWindow.innerHeight = 667;
});

it("should use 2 columns on mobile viewport", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // With 100 items and 2 columns, we have 50 rows (100 ÷ 2 = 50)
  // Each row: itemHeight (50) + gap (10) = 60px
  // Total: 50 rows * 60px - final gap = 3000 - 10 = 2990px
  expect(result.current.totalHeight).toBe(2990);
});

it("should calculate correct item positions for 2-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 10), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // Test first row (items 0-1)
  expect(visibleItems[0].offsetY).toBe(0); // Row 0
  expect(visibleItems[1].offsetY).toBe(0); // Row 0, last column

  // Test second row (items 2-3)
  expect(visibleItems[2].offsetY).toBe(120); // Row 1: (100 + 20) * 1
  expect(visibleItems[3].offsetY).toBe(120); // Row 1, last column

  // Test third row (items 4-5)
  expect(visibleItems[4].offsetY).toBe(240); // Row 2: (100 + 20) * 2
  expect(visibleItems[5].offsetY).toBe(240); // Row 2, last column

  // Test fourth row (items 6-7)
  expect(visibleItems[6].offsetY).toBe(360); // Row 3: (100 + 20) * 3
  expect(visibleItems[7].offsetY).toBe(360); // Row 3, last column
});

it("should calculate correct item widths for 2-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 2), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // With 2 columns and 20px gap, width calculation:
  // calc(50% - 10px) where 10px = ((2-1) * 20) / 2
  expect(visibleItems[0].width).toBe("calc(50% - 10px)");
  expect(visibleItems[1].width).toBe("calc(50% - 10px)");
});

it("should calculate correct offsetX for each column in 2-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 2), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // Test offsetX for each column
  expect(visibleItems[0].offsetX).toBe("calc(0% + 0px)"); // Column 0
  expect(visibleItems[1].offsetX).toBe("calc(50% + 20px)"); // Column 1
});

it("should maintain 2 columns when resizing within mobile range", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  const initialHeight = result.current.totalHeight;

  act(() => {
    // Resize within mobile range (<640px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 320,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should remain the same (still 2 columns)
  expect(result.current.totalHeight).toBe(initialHeight);
});

it("should switch from 2 to 3 columns when resizing to tablet", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  const mobileHeight = result.current.totalHeight; // 2 columns = 2990px

  act(() => {
    // Resize to tablet width (640px-767px = 3 columns)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 700,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should decrease (more columns = fewer rows)
  // 100 items ÷ 3 columns = 34 rows (33.33 rounded up)
  // 34 rows * 60px - 10px = 2030px
  expect(result.current.totalHeight).toBe(2030);
  expect(result.current.totalHeight).toBeLessThan(mobileHeight);
});

it("should switch from 2 to 5 columns when resizing to desktop", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  const mobileHeight = result.current.totalHeight; // 2 columns = 2990px

  act(() => {
    // Resize to desktop width (≥768px = 5 columns)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should decrease significantly (more columns = fewer rows)
  // 100 items ÷ 5 columns = 20 rows
  // 20 rows * 60px - 10px = 1190px
  expect(result.current.totalHeight).toBe(1190);
  expect(result.current.totalHeight).toBeLessThan(mobileHeight);
});

it("should render correct visible items for mobile scroll behavior", () => {
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
  const minExpectedIndex = 2; // Start of second row (2 columns per row)
  const hasItemsFromSecondRow = visibleItems.some(
    (vi) => vi.index >= minExpectedIndex
  );
  expect(hasItemsFromSecondRow).toBe(true);
});

it("should handle mobile viewport with longer scroll distances", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 120, overscan: 2, gap: 16 })
  );

  // Mobile has more rows, so test scrolling deeper
  act(() => {
    // Scroll past first 10 rows (each row = 120 + 16 = 136px)
    // 10 rows * 136px = 1360px
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 1500,
    });
    window.dispatchEvent(new Event("scroll"));
  });

  const visibleItems = result.current.visibleItems;
  expect(visibleItems.length).toBeGreaterThan(0);

  // Should be showing items from around row 10+ (items 20+)
  const minExpectedIndex = 20; // Around 10th row (2 columns per row)
  const hasItemsFromLaterRows = visibleItems.some(
    (vi) => vi.index >= minExpectedIndex
  );
  expect(hasItemsFromLaterRows).toBe(true);
});

it("should handle edge case at mobile breakpoint boundary", () => {
  // Test exactly at 639px (just below tablet breakpoint)
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 639,
    });
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  expect(result.current.totalHeight).toBe(2990); // Should be 2 columns
});

it("should work with very small mobile screens", () => {
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 280, // Very small mobile screen
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      configurable: true,
      value: 500,
    });
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 80, gap: 8 })
  );

  // Should still work with 2 columns
  // 100 items ÷ 2 columns = 50 rows
  // 50 rows * (80 + 8) - 8 = 4392px
  expect(result.current.totalHeight).toBe(4392);
  expect(result.current.visibleItems.length).toBeGreaterThan(0);
});

it("should use mobile layout below tablet breakpoint (639px)", () => {
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: responsiveBreakpoints.TABLET_MIN_WIDTH - 1, // 639px
    });
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // Should use 2 columns (mobile layout)
  expect(result.current.totalHeight).toBe(2990); // 50 rows * 60px - 10px
  expect(result.current.visibleItems[0].width).toContain("50%"); // 100% / 2 = 50%
});

it("should verify mobile domain constants", () => {
  // Ensure mobile constants match expected business rules
  expect(responsiveBreakpoints.MOBILE_COLUMNS).toBe(2);
});
