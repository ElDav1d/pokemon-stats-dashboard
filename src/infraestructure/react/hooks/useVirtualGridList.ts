import { useState, useMemo, useLayoutEffect, useCallback } from "react";
import {
  VirtualGridCalculator,
  ResponsiveBreakpoints,
} from "../../virtualization/VirtualGridCalculator";

// Default breakpoints for infrastructure layer (fallback)
const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  DESKTOP_MIN_WIDTH: 768,
  TABLET_MIN_WIDTH: 640,
  DESKTOP_COLUMNS: 5,
  TABLET_COLUMNS: 3,
  MOBILE_COLUMNS: 2,
};

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  gap?: number;
  breakpoints?: ResponsiveBreakpoints; // 🎯 Inject domain breakpoints
}

interface VirtualListResult<T> {
  visibleItems: Array<{
    item: T;
    index: number;
    offsetY: number;
    offsetX: string;
    width: string;
  }>;
  totalHeight: number;
}

export function useVirtualGridList<T>(
  items: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const {
    itemHeight,
    overscan = 0,
    gap = 0,
    breakpoints = DEFAULT_BREAKPOINTS,
  } = options;

  const [scrollTop, setScrollTop] = useState(0);
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return breakpoints.MOBILE_COLUMNS;
    return VirtualGridCalculator.calculateColumns(
      window.innerWidth,
      breakpoints
    );
  });

  // Optimized event handlers with useCallback
  const updateColumns = useCallback(() => {
    const width = window.innerWidth;
    setColumns(VirtualGridCalculator.calculateColumns(width, breakpoints));
  }, [breakpoints]);

  const handleWindowScroll = useCallback(() => {
    setScrollTop(window.scrollY);
  }, []);

  // Ensure columns are correct on mount
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const correctColumns = VirtualGridCalculator.calculateColumns(
        width,
        breakpoints
      );
      if (correctColumns !== columns) {
        setColumns(correctColumns);
      }
    }
  }, [columns, breakpoints]);

  // Listen for window resize to update columns
  useLayoutEffect(() => {
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, [updateColumns]);

  // Listen for window scroll instead of container scroll
  useLayoutEffect(() => {
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [handleWindowScroll]);

  // Core virtualization logic delegation
  const calculator = useMemo(() => {
    return new VirtualGridCalculator(items, {
      itemHeight,
      gap,
      overscan,
      columns,
      viewportHeight: typeof window !== "undefined" ? window.innerHeight : 600,
      scrollTop,
    });
  }, [items, itemHeight, gap, overscan, columns, scrollTop]);

  const visibleItems = useMemo(
    () => calculator.getVisibleItems(),
    [calculator]
  );
  const totalHeight = useMemo(
    () => calculator.calculateTotalHeight(),
    [calculator]
  );
  return {
    visibleItems,
    totalHeight,
  };
}
