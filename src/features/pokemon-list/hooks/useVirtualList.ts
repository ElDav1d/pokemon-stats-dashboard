import React, { useState, useMemo } from "react";

interface UseVirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualListResult<T> {
  visibleItems: Array<{
    item: T;
    index: number;
    offsetY: number;
  }>;
  totalHeight: number;
  onScroll: (e: React.UIEvent<HTMLElement>) => void;
}

export function useVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
}: UseVirtualListProps<T>): VirtualListResult<T> {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length
    );

    // Add overscan items for smoother scrolling
    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length, visibleEnd + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  const visibleItems = useMemo(() => {
    return items
      .slice(visibleRange.startIndex, visibleRange.endIndex)
      .map((item, index) => ({
        item,
        index: visibleRange.startIndex + index,
        offsetY: (visibleRange.startIndex + index) * itemHeight,
      }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  const onScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    onScroll,
  };
}
