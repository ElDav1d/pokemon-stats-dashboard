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
