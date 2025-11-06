import { useState, useMemo, useLayoutEffect, useCallback } from "react";
import {
  VirtualGridCalculator,
  ResponsiveBreakpoints,
} from "../../virtualization/VirtualGridCalculator";

// Default breakpoints for infrastructure layer (fallback)
const DEFAULT_BREAKPOINTS: ResponsiveBreakpoints = {
  desktopMinWidth: 768,
  tabletMinWidth: 640,
  desktopColumns: 5,
  tabletColumns: 3,
  mobileColumns: 2,
};

interface UseVirtualGridListConfig {
  itemHeight: number;
  gap: number;
  overscan: number;
}

const DEFAULT_CONFIG: UseVirtualGridListConfig = {
  itemHeight: 200,
  gap: 0,
  overscan: 0,
};

interface VirtualListOptions {
  config?: UseVirtualGridListConfig;
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
  const { config = DEFAULT_CONFIG, breakpoints = DEFAULT_BREAKPOINTS } =
    options;

  const [scrollTop, setScrollTop] = useState(0);
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return breakpoints.mobileColumns;
    return VirtualGridCalculator.calculateColumns(
      window.innerWidth,
      breakpoints
    );
  });

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
      itemHeight: config.itemHeight,
      gap: config.gap,
      overscan: config.overscan,
      columns,
      viewportHeight: typeof window !== "undefined" ? window.innerHeight : 600,
      scrollTop,
    });
  }, [items, config, columns, scrollTop]);

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
