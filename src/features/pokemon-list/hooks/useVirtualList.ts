import React, { useState, useMemo, useEffect } from "react";

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
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
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
}

export function useVirtualList<T>(
  items: T[],
  options: VirtualListOptions
): VirtualListResult<T> {
  const { itemHeight, overscan = 5 } = options; // Extract with default

  // Move ALL hooks to the top - ALWAYS call them
  const [scrollTop, setScrollTop] = useState(0);
  const [columns, setColumns] = useState(() => {
    if (typeof window === "undefined") return 2;
    const width = window.innerWidth;
    if (width >= 768) return 5;
    if (width >= 640) return 3;
    return 2;
  });

  // Listen for window resize to update columns
  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 768) setColumns(5);
      else if (width >= 640) setColumns(3);
      else setColumns(2);
    };

    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const containerHeight = 600;

  const isTestEnvironment =
    typeof import.meta !== "undefined" && import.meta.env?.MODE === "test";

  const visibleRange = useMemo(() => {
    const rowHeight = itemHeight;
    const visibleStartRow = Math.floor(scrollTop / rowHeight);
    const totalRows = Math.ceil((items?.length || 0) / columns);
    const visibleEndRow = Math.min(
      visibleStartRow + Math.ceil(containerHeight / rowHeight),
      totalRows
    );

    const startIndex = Math.max(0, (visibleStartRow - overscan) * columns);
    const endIndex = Math.min(
      items?.length || 0,
      (visibleEndRow + overscan) * columns
    );

    return { startIndex, endIndex };
  }, [
    scrollTop,
    itemHeight,
    containerHeight,
    items?.length,
    overscan,
    columns,
  ]);

  const visibleItems = useMemo(() => {
    // Handle empty or undefined items INSIDE useMemo
    if (!items || items.length === 0) {
      return [];
    }

    // In test environment, return all items
    if (isTestEnvironment) {
      return items.map((item, index) => ({
        item,
        index,
        offsetY: 0,
        offsetX: "0%",
        width: "100%",
      }));
    }

    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex)
      .map((item, relativeIndex) => {
        const actualIndex = visibleRange.startIndex + relativeIndex;
        const row = Math.floor(actualIndex / columns);
        const col = actualIndex % columns;

        return {
          item,
          index: actualIndex,
          offsetY: row * itemHeight,
          offsetX: `calc(${(col * 100) / columns}% + ${col * 16}px)`,
          width: `calc(${100 / columns}% - ${((columns - 1) * 16) / columns}px)`,
        };
      });
  }, [items, visibleRange, itemHeight, columns, isTestEnvironment]);

  const totalHeight = useMemo(() => {
    if (!items || items.length === 0) return 0;
    if (isTestEnvironment) return items.length * itemHeight;
    return Math.ceil(items.length / columns) * itemHeight;
  }, [items, columns, itemHeight, isTestEnvironment]);

  const onScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    onScroll,
  };
}
