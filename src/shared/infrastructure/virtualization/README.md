# Virtual Grid System - Clean Architecture

This directory contains a framework-agnostic virtual grid implementation following Clean Architecture principles.

## Architecture

### Core Logic (Framework Independent)
- **`VirtualGridCalculator.ts`** - Pure TypeScript class with no framework dependencies
- Handles all virtualization calculations
- Can be used in React, Vue, Angular, or vanilla JavaScript
- Fully testable without any framework setup

### Framework Adapters
- **React**: `useVirtualGridList.ts` (current implementation)
- **Vue**: Example in `examples/FrameworkExamples.ts`
- **Angular**: Example service pattern included
- **Vanilla JS**: Direct class usage

## Benefits of This Approach

### ✅ **Framework Independence**
```typescript
// Same core logic works everywhere
const calculator = new VirtualGridCalculator(items, config);
const visibleItems = calculator.getVisibleItems();
```

### ✅ **Easy Testing**
```typescript
// No React testing library needed for core logic
const calculator = new VirtualGridCalculator(mockItems, mockConfig);
expect(calculator.calculateTotalHeight()).toBe(1190);
```

### ✅ **Reusability**
- Use in React components
- Use in Vue composables  
- Use in Angular services
- Use in any JavaScript environment

### ✅ **Maintainability**
- Business logic separated from framework concerns
- Single source of truth for virtualization calculations
- Easy to debug and modify core behavior

## Usage Examples

### React Hook (Current)
```typescript
const { visibleItems, totalHeight } = useVirtualGridList(items, {
  itemHeight: 100,
  gap: 16,
  overscan: 2
});
```

### Vue Composable (Example)
```typescript
const { visibleItems, totalHeight } = useVirtualGridListVue(items, {
  itemHeight: 100,
  gap: 16,
  overscan: 2
});
```

### Vanilla JavaScript
```typescript
const calculator = new VirtualGridCalculator(items, {
  itemHeight: 100,
  gap: 16,
  overscan: 2,
  columns: 5,
  viewportHeight: window.innerHeight,
  scrollTop: window.scrollY
});

const visibleItems = calculator.getVisibleItems();
const totalHeight = calculator.calculateTotalHeight();
```

## Files Structure

```
src/shared/infrastructure/virtualization/
├── VirtualGridCalculator.ts           # Core framework-independent logic
├── __tests__/
│   └── VirtualGridCalculator.test.ts  # Pure unit tests
└── examples/
    └── FrameworkExamples.ts           # Usage examples for different frameworks
```

## Clean Architecture Compliance

- **Infrastructure Layer**: Technical virtualization concerns
- **No Business Logic**: Pure performance optimization
- **Dependency Inversion**: Framework adapters depend on core, not vice versa
- **Single Responsibility**: Each class has one reason to change

This implementation demonstrates true Clean Architecture by separating technical concerns from framework-specific code.
