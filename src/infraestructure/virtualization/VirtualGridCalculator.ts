import { responsiveBreakpoints } from "../../features/pokemon-list/domain/constants";

// Domain constants for responsive breakpoints
export interface VirtualGridConfig {
  itemHeight: number;
  gap: number;
  overscan: number;
  columns: number;
  viewportHeight: number;
  scrollTop: number;
}

export interface VirtualGridItem<T> {
  item: T;
  index: number;
  offsetY: number;
  offsetX: string;
  width: string;
}

export interface VirtualGridRange {
  startIndex: number;
  endIndex: number;
}

export class VirtualGridCalculator<T> {
  constructor(
    private readonly items: T[],
    private readonly config: VirtualGridConfig
  ) {}

  calculateVisibleRange(): VirtualGridRange {
    if (!this.items || this.items.length === 0) {
      return { startIndex: 0, endIndex: 0 };
    }

    const rowHeight = this.config.itemHeight + this.config.gap;
    const containerTop = 0; // Assuming list starts at top of page

    const visibleStartRow = Math.floor(
      Math.max(0, this.config.scrollTop - containerTop) / rowHeight
    );
    const totalRows = Math.ceil(this.items.length / this.config.columns);
    const visibleEndRow = Math.min(
      visibleStartRow + Math.ceil(this.config.viewportHeight / rowHeight),
      totalRows
    );

    const startIndex = Math.max(
      0,
      (visibleStartRow - this.config.overscan) * this.config.columns
    );
    const endIndex = Math.min(
      this.items.length,
      (visibleEndRow + this.config.overscan) * this.config.columns
    );

    return { startIndex, endIndex };
  }

  calculateItemPosition(actualIndex: number): {
    offsetY: number;
    offsetX: string;
    width: string;
  } {
    const row = Math.floor(actualIndex / this.config.columns);
    const col = actualIndex % this.config.columns;

    return {
      offsetY: row * (this.config.itemHeight + this.config.gap),
      offsetX: `calc(${(col * 100) / this.config.columns}% + ${col * this.config.gap}px)`,
      width: `calc(${100 / this.config.columns}% - ${((this.config.columns - 1) * this.config.gap) / this.config.columns}px)`,
    };
  }

  calculateTotalHeight(): number {
    if (!this.items || this.items.length === 0) return 0;

    const totalRows = Math.ceil(this.items.length / this.config.columns);
    const rowHeight = this.config.itemHeight + this.config.gap;

    return totalRows * rowHeight - this.config.gap; // Subtract last gap since there's no gap after the last row
  }

  getVisibleItems(): VirtualGridItem<T>[] {
    if (!this.items || this.items.length === 0) {
      return [];
    }

    const { startIndex, endIndex } = this.calculateVisibleRange();

    return this.items.slice(startIndex, endIndex).map((item, relativeIndex) => {
      const actualIndex = startIndex + relativeIndex;
      const position = this.calculateItemPosition(actualIndex);

      return {
        item,
        index: actualIndex,
        ...position,
      };
    });
  }

  static calculateColumns(width: number): number {
    if (width >= responsiveBreakpoints.DESKTOP_MIN_WIDTH) {
      return responsiveBreakpoints.DESKTOP_COLUMNS;
    }
    if (width >= responsiveBreakpoints.TABLET_MIN_WIDTH) {
      return responsiveBreakpoints.TABLET_COLUMNS;
    }
    return responsiveBreakpoints.MOBILE_COLUMNS;
  }
}
export { responsiveBreakpoints };
