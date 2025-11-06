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
