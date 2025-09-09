import { useState, useMemo, useLayoutEffect, useCallback } from "react";

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  gap?: number;
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
  const { itemHeight, overscan = 0, gap = 0 } = options; // Extract with defaults

  const [scrollTop, setScrollTop] = useState(0);
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 2;
    const width = window.innerWidth;
    if (width >= 768) return 5;
    if (width >= 640) return 3;
    return 2;
  });

  // Optimized calculation functions with useCallback
  const calculateColumns = useCallback((width: number) => {
    if (width >= 768) return 5;
    if (width >= 640) return 3;
    return 2;
  }, []);

  // Ensure columns are correct on mount
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      const width = window.innerWidth;
      const correctColumns = calculateColumns(width);
      if (correctColumns !== columns) {
        setColumns(correctColumns);
      }
    }
  }, [calculateColumns]);

  // Optimized event handlers with useCallback
  const updateColumns = useCallback(() => {
    const width = window.innerWidth;
    setColumns(calculateColumns(width));
  }, [calculateColumns]);

  const handleWindowScroll = useCallback(() => {
    setScrollTop(window.scrollY);
  }, []);

  // Optimized item positioning calculation
  const calculateItemPosition = useCallback(
    (actualIndex: number, columns: number, itemHeight: number, gap: number) => {
      const row = Math.floor(actualIndex / columns);
      const col = actualIndex % columns;

      return {
        offsetY: row * (itemHeight + gap),
        offsetX: `calc(${(col * 100) / columns}% + ${col * gap}px)`,
        width: `calc(${100 / columns}% - ${((columns - 1) * gap) / columns}px)`,
      };
    },
    []
  );

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

  const visibleRange = useMemo(() => {
    const rowHeight = itemHeight + gap;
    const containerTop = 0; // Assuming list starts at top of page, adjust if needed
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 600;

    const visibleStartRow = Math.floor(
      Math.max(0, scrollTop - containerTop) / rowHeight
    );
    const totalRows = Math.ceil((items?.length || 0) / columns);
    const visibleEndRow = Math.min(
      visibleStartRow + Math.ceil(viewportHeight / rowHeight),
      totalRows
    );

    const startIndex = Math.max(0, (visibleStartRow - overscan) * columns);
    const endIndex = Math.min(
      items?.length || 0,
      (visibleEndRow + overscan) * columns
    );

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, gap, items?.length, overscan, columns]);

  const visibleItems = useMemo(() => {
    // Handle empty or undefined items INSIDE useMemo
    if (!items || items.length === 0) {
      return [];
    }

    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex)
      .map((item, relativeIndex) => {
        const actualIndex = visibleRange.startIndex + relativeIndex;
        const position = calculateItemPosition(
          actualIndex,
          columns,
          itemHeight,
          gap
        );

        return {
          item,
          index: actualIndex,
          ...position,
        };
      });
  }, [items, visibleRange, columns, itemHeight, gap, calculateItemPosition]);

  const totalHeight = useMemo(() => {
    if (!items || items.length === 0) return 0;

    const totalRows = Math.ceil(items.length / columns);
    const rowHeight = itemHeight + gap;

    return totalRows * rowHeight - gap; // Subtract last gap since there's no gap after the last row
  }, [items, columns, itemHeight, gap]);
  return {
    visibleItems,
    totalHeight,
  };
}
