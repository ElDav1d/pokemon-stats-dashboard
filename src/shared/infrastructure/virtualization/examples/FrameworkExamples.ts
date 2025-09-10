// Example: Vue.js adapter using the same core logic
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { VirtualGridCalculator, type VirtualGridConfig } from '../VirtualGridCalculator';

interface VirtualListOptions {
  itemHeight: number;
  overscan?: number;
  gap?: number;
}

export function useVirtualGridListVue<T>(
  items: T[],
  options: VirtualListOptions
) {
  const scrollTop = ref(0);
  const columns = ref(2);

  const updateColumns = () => {
    columns.value = VirtualGridCalculator.calculateColumns(window.innerWidth);
  };

  const handleWindowScroll = () => {
    scrollTop.value = window.scrollY;
  };

  // Vue lifecycle
  onMounted(() => {
    updateColumns();
    window.addEventListener('resize', updateColumns);
    window.addEventListener('scroll', handleWindowScroll);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateColumns);
    window.removeEventListener('scroll', handleWindowScroll);
  });

  // Core virtualization logic (same as React!)
  const calculator = computed(() => {
    return new VirtualGridCalculator(items, {
      itemHeight: options.itemHeight,
      gap: options.gap || 0,
      overscan: options.overscan || 0,
      columns: columns.value,
      viewportHeight: window.innerHeight,
      scrollTop: scrollTop.value,
    });
  });

  const visibleItems = computed(() => calculator.value.getVisibleItems());
  const totalHeight = computed(() => calculator.value.calculateTotalHeight());

  return {
    visibleItems,
    totalHeight,
  };
}

// Example: Angular service
/*
import { Injectable } from '@angular/core';
import { VirtualGridCalculator } from '../VirtualGridCalculator';

@Injectable({
  providedIn: 'root'
})
export class VirtualGridService<T> {
  private calculator!: VirtualGridCalculator<T>;
  
  initialize(items: T[], config: VirtualGridConfig) {
    this.calculator = new VirtualGridCalculator(items, config);
  }
  
  getVisibleItems() {
    return this.calculator.getVisibleItems();
  }
  
  getTotalHeight() {
    return this.calculator.calculateTotalHeight();
  }
}
*/

// Example: Vanilla JavaScript usage
/*
const items = [{ id: 1, name: 'Item 1' }, ...];
const config = {
  itemHeight: 100,
  gap: 16,
  overscan: 2,
  columns: VirtualGridCalculator.calculateColumns(window.innerWidth),
  viewportHeight: window.innerHeight,
  scrollTop: window.scrollY,
};

const virtualGrid = new VirtualGridCalculator(items, config);
const visibleItems = virtualGrid.getVisibleItems();
const totalHeight = virtualGrid.calculateTotalHeight();
*/
