import { it, expect, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVirtualGridList } from "../useVirtualGridList";
import { responsiveBreakpoints } from "../../../virtualization/VirtualGridCalculator";

// Mock items for testing
const mockItems = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  name: `Item ${index + 1}`,
}));

const mockWindow = {
  scrollY: 0,
  innerHeight: 768,
  addEventListener: () => {},
  removeEventListener: () => {},
};

beforeEach(() => {
  Object.defineProperty(window, "scrollY", {
    value: mockWindow.scrollY,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: mockWindow.innerHeight,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "addEventListener", {
    value: mockWindow.addEventListener,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(window, "removeEventListener", {
    value: mockWindow.removeEventListener,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
});

it("should apply desktop breakpoint rules (≥768px = 5 columns)", () => {
  Object.defineProperty(window, "innerWidth", {
    value: responsiveBreakpoints.DESKTOP_MIN_WIDTH,
    writable: true,
    configurable: true,
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // With 100 items and 5 columns = 20 rows
  const expectedHeight = 20 * 60 - 10; // 1190px
  expect(result.current.totalHeight).toBe(expectedHeight);

  // Verify 5-column layout through item width
  expect(result.current.visibleItems[0].width).toContain("20%"); // 100% / 5 = 20%
});

it("should apply tablet breakpoint rules (640px-767px = 3 columns)", () => {
  Object.defineProperty(window, "innerWidth", {
    value: responsiveBreakpoints.TABLET_MIN_WIDTH,
    writable: true,
    configurable: true,
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // With 100 items and 3 columns = 34 rows (100/3 = 33.33 → 34)
  const expectedHeight = 34 * 60 - 10; // 2030px
  expect(result.current.totalHeight).toBe(expectedHeight);

  // Verify 3-column layout through item width
  expect(result.current.visibleItems[0].width).toContain("33.333333333333336%"); // 100% / 3
});

it("should apply mobile breakpoint rules (<640px = 2 columns)", () => {
  Object.defineProperty(window, "innerWidth", {
    value: responsiveBreakpoints.TABLET_MIN_WIDTH - 1, // 639px
    writable: true,
    configurable: true,
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // With 100 items and 2 columns = 50 rows
  const expectedHeight = 50 * 60 - 10; // 2990px
  expect(result.current.totalHeight).toBe(expectedHeight);

  // Verify 2-column layout through item width
  expect(result.current.visibleItems[0].width).toContain("50%"); // 100% / 2 = 50%
});

it("should use domain constants for breakpoint calculations", () => {
  // Test exact breakpoint values from domain constants
  Object.defineProperty(window, "innerWidth", {
    value: responsiveBreakpoints.DESKTOP_MIN_WIDTH - 1, // 767px (tablet)
    writable: true,
    configurable: true,
  });

  const { result: tabletResult } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // Should be 3 columns (tablet)
  expect(tabletResult.current.totalHeight).toBe(34 * 60 - 10);

  Object.defineProperty(window, "innerWidth", {
    value: responsiveBreakpoints.DESKTOP_MIN_WIDTH, // 768px (desktop)
    writable: true,
    configurable: true,
  });

  const { result: desktopResult } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // Should be 5 columns (desktop)
  expect(desktopResult.current.totalHeight).toBe(20 * 60 - 10);
});

it("should handle responsive transitions correctly", () => {
  // Start with desktop
  Object.defineProperty(window, "innerWidth", {
    value: 1024,
    writable: true,
    configurable: true,
  });

  const { result } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // Initially desktop (5 columns)
  expect(result.current.totalHeight).toBe(20 * 60 - 10);

  // Simulate resize to tablet
  Object.defineProperty(window, "innerWidth", {
    value: 700,
    writable: true,
    configurable: true,
  });

  // Re-render with new window width
  const { result: tabletResult } = renderHook(() =>
    useVirtualGridList(mockItems, { itemHeight: 50, gap: 10 })
  );

  // Now tablet (3 columns)
  expect(tabletResult.current.totalHeight).toBe(34 * 60 - 10);
});

it("should verify domain constants values", () => {
  // Ensure our domain constants match expected business rules
  expect(responsiveBreakpoints.DESKTOP_MIN_WIDTH).toBe(768);
  expect(responsiveBreakpoints.TABLET_MIN_WIDTH).toBe(640);
  expect(responsiveBreakpoints.DESKTOP_COLUMNS).toBe(5);
  expect(responsiveBreakpoints.TABLET_COLUMNS).toBe(3);
  expect(responsiveBreakpoints.MOBILE_COLUMNS).toBe(2);
});
