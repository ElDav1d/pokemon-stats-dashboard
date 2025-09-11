import { renderHook, act } from "@testing-library/react";
import { useVirtualGridList } from "../useVirtualGridList";
import { it, expect, beforeEach, afterEach } from "vitest";
import { ResponsiveBreakpoints } from "../../../virtualization/VirtualGridCalculator";

// Test breakpoints for tablet tests
const testBreakpoints: ResponsiveBreakpoints = {
  DESKTOP_MIN_WIDTH: 768,
  TABLET_MIN_WIDTH: 640,
  DESKTOP_COLUMNS: 5,
  TABLET_COLUMNS: 3,
  MOBILE_COLUMNS: 2,
};

const mockItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

// Mock window properties for tablet viewport (640px-767px = 3 columns)
const mockWindow = {
  scrollY: 0,
  innerWidth: 700, // Tablet width
  innerHeight: 768,
};

beforeEach(() => {
  // Mock window properties for tablet
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
  mockWindow.innerWidth = 700;
  mockWindow.innerHeight = 768;
});

it("should use 3 columns on tablet viewport", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  // With 100 items and 3 columns, we have 34 rows (100 ÷ 3 = 33.33 → 34)
  // Each row: itemHeight (50) + gap (10) = 60px
  // Total: 34 rows * 60px - final gap = 2040 - 10 = 2030px
  expect(result.current.totalHeight).toBe(2030);
});

it("should calculate correct item positions for 3-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 12), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // Test first row (items 0-2)
  expect(visibleItems[0].offsetY).toBe(0); // Row 0
  expect(visibleItems[1].offsetY).toBe(0); // Row 0
  expect(visibleItems[2].offsetY).toBe(0); // Row 0, last column

  // Test second row (items 3-5)
  expect(visibleItems[3].offsetY).toBe(120); // Row 1: (100 + 20) * 1
  expect(visibleItems[5].offsetY).toBe(120); // Row 1, last column

  // Test third row (items 6-8)
  expect(visibleItems[6].offsetY).toBe(240); // Row 2: (100 + 20) * 2

  // Test fourth row (items 9-11)
  expect(visibleItems[9].offsetY).toBe(360); // Row 3: (100 + 20) * 3
});

it("should calculate correct item widths for 3-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 3), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // With 3 columns and 20px gap, width calculation:
  // calc(33.333333333333336% - 13.333333333333334px) where 13.33px = ((3-1) * 20) / 3
  expect(visibleItems[0].width).toBe(
    "calc(33.333333333333336% - 13.333333333333334px)"
  );
  expect(visibleItems[2].width).toBe(
    "calc(33.333333333333336% - 13.333333333333334px)"
  );
});

it("should calculate correct offsetX for each column in 3-column layout", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems.slice(0, 3), { itemHeight: 100, gap: 20 })
  );

  const visibleItems = result.current.visibleItems;

  // Test offsetX for each column
  expect(visibleItems[0].offsetX).toBe("calc(0% + 0px)"); // Column 0
  expect(visibleItems[1].offsetX).toBe("calc(33.333333333333336% + 20px)"); // Column 1
  expect(visibleItems[2].offsetX).toBe("calc(66.66666666666667% + 40px)"); // Column 2
});

it("should maintain 3 columns when resizing within tablet range", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  const initialHeight = result.current.totalHeight;

  act(() => {
    // Resize within tablet range (640px-767px)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 650,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should remain the same (still 3 columns)
  expect(result.current.totalHeight).toBe(initialHeight);
});

it("should switch from 3 to 5 columns when resizing to desktop", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  const tabletHeight = result.current.totalHeight; // 3 columns = 2030px

  act(() => {
    // Resize to desktop width (≥768px = 5 columns)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should decrease (more columns = fewer rows)
  // 100 items ÷ 5 columns = 20 rows
  // 20 rows * 60px - 10px = 1190px
  expect(result.current.totalHeight).toBe(1190);
  expect(result.current.totalHeight).toBeLessThan(tabletHeight);
});

it("should switch from 3 to 2 columns when resizing to mobile", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  const tabletHeight = result.current.totalHeight; // 3 columns = 2030px

  act(() => {
    // Resize to mobile width (<640px = 2 columns)
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 500,
    });
    window.dispatchEvent(new Event("resize"));
  });

  // Height should increase (fewer columns = more rows)
  // 100 items ÷ 2 columns = 50 rows
  // 50 rows * 60px - 10px = 2990px
  expect(result.current.totalHeight).toBe(2990);
  expect(result.current.totalHeight).toBeGreaterThan(tabletHeight);
});

it("should render correct visible items for tablet scroll behavior", () => {
  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 100,
      overscan: 1,
      gap: 10,
    })
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
  const minExpectedIndex = 3; // Start of second row (3 columns per row)
  const hasItemsFromSecondRow = visibleItems.some(
    (vi) => vi.index >= minExpectedIndex
  );
  expect(hasItemsFromSecondRow).toBe(true);
});

it("should handle edge case at tablet breakpoint boundaries", () => {
  // Test exactly at 640px (lower boundary)
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 640,
    });
  });

  const { result: result640 } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  expect(result640.current.totalHeight).toBe(2030); // Should be 3 columns

  // Test exactly at 767px (upper boundary)
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 767,
    });
  });

  const { result: result767 } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  expect(result767.current.totalHeight).toBe(2030); // Should still be 3 columns
});

it("should use tablet layout at upper boundary (767px)", () => {
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: testBreakpoints.DESKTOP_MIN_WIDTH - 1, // 767px
    });
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  // Should use 3 columns (tablet layout)
  expect(result.current.totalHeight).toBe(2030); // 34 rows * 60px - 10px
  expect(result.current.visibleItems[0].width).toContain("33.333333333333336%"); // 100% / 3
});

it("should use tablet layout at lower boundary (640px)", () => {
  act(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: testBreakpoints.TABLET_MIN_WIDTH, // 640px exactly
    });
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, {
      breakpoints: testBreakpoints,
      itemHeight: 50,
      gap: 10,
      breakpoints: testBreakpoints,
    })
  );

  // Should use 3 columns (tablet layout)
  expect(result.current.totalHeight).toBe(2030); // 34 rows * 60px - 10px
  expect(result.current.visibleItems[0].width).toContain("33.333333333333336%"); // 100% / 3
});

it("should verify tablet domain constants", () => {
  // Ensure tablet constants match expected business rules
  expect(testBreakpoints.TABLET_MIN_WIDTH).toBe(640);
  expect(testBreakpoints.TABLET_COLUMNS).toBe(3);
});
