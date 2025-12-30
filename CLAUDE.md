# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL RULE: Git Workflow

**NEVER commit changes automatically. The user will commit manually.**

- ❌ Do NOT use `git commit` commands
- ❌ Do NOT use `git add` followed by `git commit`
- ✅ Make file changes as requested
- ✅ Let the user review and commit manually when they approve

**Why:** The user wants full control over commit messages and timing.

## Project Overview

A React-based Pokemon dashboard application implementing advanced performance optimizations and hexagonal architecture patterns. The project uses the PokeAPI to provide Pokemon data visualization with a custom virtual scrolling system for large datasets.

**Tech Stack**: React 19 + TypeScript, Vite, React Router 7, Tailwind CSS 4, Vitest

**Package Manager**: npm 10.6.5 (required)

**Dependency Constraint**: All dependencies are **pinned to exact versions** (no `^` or `~`). This ensures consistency across all environments and builds. Never add `^` or `~` prefixes when installing new packages. Use `npm install <package>@version` with exact version.

## Common Commands

### Development

```bash
npm dev          # Start development server on port 3000
npm build        # TypeScript compile + Vite build
npm preview      # Preview production build
```

### Testing

```bash
npm test         # Run tests in watch mode
vitest run        # Run tests once without watch
vitest --ui       # Open Vitest UI
```

### Code Quality

```bash
npm lint         # Run ESLint (TypeScript files)
npm format       # Format code with Prettier
```

### Installing Dependencies

**Workflow for adding new packages**:

1. Install the latest version: `npm install package-name`
2. Manually remove `^` and `~` prefixes in `package.json` to pin to exact version

**Example**:

```bash
npm install lodash
# This adds "lodash": "^4.17.21" in package.json
# ↓ manually change to:
# "lodash": "4.17.21"
```

### Running Single Test

```bash
vitest run src/path/to/test.test.ts          # Run single test file
vitest run -t "test name pattern"             # Run tests matching pattern
```

## Architecture Overview

The codebase implements **Hexagonal Architecture** (Ports & Adapters) with clear separation between domain, application, and infrastructure layers.

### Layer Structure

```
┌─────────────────────────────────────┐
│   UI LAYER (Pages)                  │  Route handlers, minimal logic
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   FEATURE LAYER (Components)        │  Connected feature components
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   APPLICATION LAYER (Use Cases)     │  Business logic orchestration
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│   DOMAIN LAYER (Ports & Entities)   │  Core business rules, interfaces
└─────────────────────────────────────┘
              ↑ (implements)
┌─────────────────────────────────────┐
│   INFRASTRUCTURE (Adapters)         │  HTTP, virtualization, React hooks
└─────────────────────────────────────┘
```

### Key Architectural Patterns

**1. Ports and Adapters**

- Infrastructure depends on Domain (implements the interfaces)
- Domain defines interfaces (ports) for external dependencies
- Infrastructure provides concrete implementations (adapters)
- Example: `PokemonRepository` (port) ← `HttpPokemonRepository` (adapter)

**2. Dependency Injection**

- Configuration injected into hooks for testability
- Example: `useVirtualGridList(items, { config, breakpoints })`

**3. Value Objects**

- Immutable domain concepts that prevent "primitive obsession"
- Examples: `PokemonType`, `PokemonReference`, `PokemonByName`
- Self-validating with encapsulated business rules

**4. Rich Domain Entities (Classes, not Interfaces)**

Entities are **classes** (not interfaces) to encapsulate behavior alongside data.

**Example of a rich entity (with behavior):**

```typescript
// ✅ Rich entity encapsulates behavior
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public height: number,
    public imageUrl: string
  ) {}

  // Behavior lives in the entity
  getSizeCategory(): "small" | "medium" | "large" {
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }

  isBossTier(): boolean {
    return this.height > 30;
  }
}
```

**⚠️ Note**: This is an **example** of what a rich entity LOOKS like, **not the current project state**. In this project, entities are currently simple data containers without behavior (no `getSizeCategory()` or `isBossTier()` methods exist). If these methods are needed in the future, they would be added using TDD (test first).

**Why classes instead of interfaces:**

- Centralizes domain logic (single source of truth for "what is large")
- Encapsulates validation and business rules
- Prevents duplication across UI components
- Testeable without rendering components
- Future behavior can be added without breaking contracts

**Domain-layer tests don't need React (when entities have behavior):**

```typescript
// Pure domain logic test, no framework needed
// (This example shows testing a rich entity - only write if entity HAS behavior)
it("should classify large pokemon correctly", () => {
  const onix = new PokemonListItem("3", "onix", 88, "img.png");

  expect(onix.getSizeCategory()).toBe("large");
  expect(onix.isBossTier()).toBe(true);
});
```

**⚠️ Important**: This test only exists if `getSizeCategory()` and `isBossTier()` methods exist on the entity. Currently, project entities are simple data containers with no such methods, so no domain tests exist.

**5. View as a Humble Object**

React components are "humble" — they don't contain business logic, only rendering decisions:

```typescript
// ✅ Humble component: delegates all logic to hooks
const PokemonList = () => {
  const { pokemonList, isLoading, sortByHeight } = usePokemonList(selectedType);

  // Only orchestrates hooks and renders
  const sortedList = isSortedByHeight ? sortByHeight(pokemonList) : pokemonList;
  const { visibleItems, totalHeight } = useVirtualGridList(sortedList, config);

  return <ul>{visibleItems.map(...)}</ul>;
};
```

**Compare with non-humble (before):**

```typescript
// ❌ Non-humble: business logic mixed with rendering
const PokemonListBad = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    // Business logic should not be here
    fetch(url).then(data => {
      const sorted = data.sort((a, b) => a.height - b.height);
      setList(sorted);
    });
  }, []);

  return <ul>{list.map(...)}</ul>;
};
```

**Why humble objects matter:**

- Infrastructure complexity is hidden in hooks (HttpClient, Repository, ViewModel)
- Components become simple "orchestrators" not "doers"
- Easy to test UI through user behavior (outside-in testing from pages)
- Easy to refactor UI without touching business logic

**6. DTO Mapping**

- HTTP responses mapped to domain entities in adapter layer
- Mappers transform raw API data to domain value objects
- Creates a boundary between external API contracts and internal domain model

**7. URL-Based State**

- React Router's `useSearchParams` for Pokemon type selection
- No global state management (Redux/MobX)

**8. Shared Infrastructure Agnosticism**

Shared infrastructure (`/src/infrastructure/`) must NEVER know about specific features (`/src/features/`).

**Shared infrastructure MUST NOT:**

- ❌ Import from feature directories
- ❌ Reference specific slice names, action types, or feature properties
- ❌ Have hard-coded feature logic
- ❌ Assume feature implementation details
- ❌ Create tight coupling to feature structure

**Instead, use configuration-based patterns:**

```typescript
// ❌ BAD: Infrastructure knows about 'listPreferences' feature
export const middleware = (store) => (next) => (action) => {
  const result = next(action);
  if (action.type?.startsWith("listPreferences/")) {
    // ← Hard-coded feature name
    const dataToSave = {
      listPreferences: store.getState().listPreferences, // ← Feature-specific
    };
    localStorage.setItem(key, JSON.stringify(dataToSave));
  }
  return result;
};

// ✅ GOOD: Infrastructure accepts configuration from feature layer
export const createPersistenceMiddleware = (config: {
  storageKey: string;
  slicesToPersist: string[]; // Features decide what to persist
}) => {
  return (store) => (next) => (action) => {
    const result = next(action);
    if (
      config.slicesToPersist.some((slice) =>
        action.type?.startsWith(`${slice}/`)
      )
    ) {
      const dataToSave = config.slicesToPersist.reduce(
        (acc, slice) => ({
          ...acc,
          [slice]: store.getState()[slice],
        }),
        {}
      );
      localStorage.setItem(config.storageKey, JSON.stringify(dataToSave));
    }
    return result;
  };
};

// Feature layer configures infrastructure
const persistenceMiddleware = createPersistenceMiddleware({
  storageKey: "__pokemon-dashboard__",
  slicesToPersist: ["listPreferences"],
});
```

**Why this matters:**

- **Reusability**: Same middleware works for ANY feature
- **Decoupling**: Shared code independent from feature changes
- **Testability**: Infrastructure tested without feature knowledge
- **Scalability**: Adding new features doesn't modify shared infrastructure
- **Clean Architecture**: Respects Dependency Rule

**9. Layer-Level Index Exports**

Each layer within a feature MUST have an `index.ts` file that re-exports all public modules. This provides clean import paths and encapsulates internal structure.

**Required index files per feature:**

```
src/features/{feature-name}/
├── domain/
│   ├── index.ts              ← Re-exports all domain sublayers
│   ├── entities/
│   │   ├── index.ts          ← Re-exports all entities
│   │   └── EntityName.ts
│   ├── value-objects/
│   │   ├── index.ts          ← Re-exports all value objects
│   │   └── ValueObjectName.ts
│   ├── ports/
│   │   ├── index.ts          ← Re-exports all ports (use `export type` for interfaces)
│   │   └── RepositoryName.ts
│   └── constants.ts
```

**Pattern for each index file:**

```typescript
// domain/entities/index.ts
export { PokemonDetail } from "./PokemonDetail";
export { EvolutionChain } from "./EvolutionChain";

// domain/value-objects/index.ts
export { PokemonStat } from "./PokemonStat";
export { PokemonReference } from "./PokemonReference";

// domain/ports/index.ts (use `export type` for interfaces)
export type { PokemonDetailRepository } from "./PokemonDetailRepository";

// domain/index.ts (aggregates all sublayers)
export * from "./entities";
export * from "./value-objects";
export * from "./ports";
export * from "./constants";
```

**Benefits:**

- **Clean imports**: `import { PokemonDetail, PokemonStat } from "../domain"` instead of deep paths
- **Encapsulation**: Internal file structure can change without breaking imports
- **Discoverability**: Single entry point shows all public APIs
- **Refactoring safety**: Move files within layer without updating external imports

**Rules:**

- ✅ Always use `export type` for interfaces (ports)
- ✅ Export classes and constants with regular `export`
- ✅ Domain index re-exports from all sublayer indexes
- ❌ Never export internal/private implementations
- ❌ Never have circular dependencies between index files

## Pre-Flight Checklists

Use these checklists BEFORE implementing code to ensure compliance with project constraints.

### Before Writing ANY Code (MANDATORY)

**⚠️ STOP AND READ CLAUDE.md FIRST ⚠️**

Before touching ANY file, complete this checklist:

- [ ] I have read the relevant sections of CLAUDE.md for this task
- [ ] I understand which architectural layer I'm working in (Domain/Application/Infrastructure/UI)
- [ ] I know what testing patterns apply to this layer
- [ ] I have identified which constraints apply to my changes
- [ ] I can explain why my approach follows the guidelines

**If you answered NO to any of these, STOP and read CLAUDE.md thoroughly first.**

### Before Creating Test Helpers

**Helper Scope Verification:**

- [ ] Does this helper use `userEvent` methods (`click`, `type`, `hover`)? If NO → Don't create it
- [ ] Does this helper simulate a user action? If NO → Don't create it
- [ ] Am I extracting DOM queries, `waitFor()`, or assertions? If YES → Don't create it
- [ ] Does this helper combine element finding + user interaction? If NO → It's not a valid helper

**Valid Helper Pattern:**

```typescript
// ✅ VALID: userEvent action
export const clickTypeButton = async (typeName: string) => {
  const user = userEvent.setup();
  const button = await screen.findByRole("button", { name: new RegExp(typeName, "i") });
  await user.click(button);
};

// ❌ INVALID: DOM query without userEvent
export const getTypeSection = () => {
  return screen.getByRole("main");
};

// ❌ INVALID: waitFor wrapper
export const waitForList = () => {
  return waitFor(() => { ... });
};
```

**Remember:** Only `userEvent` actions belong in helpers. Everything else stays in the test.

### Before Implementing Shared Infrastructure (`/src/infrastructure/`)

**Feature Agnosticism Check:**

- [ ] Does my code import from `/src/features/`? If YES → Refactor to accept configuration instead
- [ ] Does my code reference specific slice names (e.g., `listPreferences`)? If YES → Use generic string parameters
- [ ] Does my code assume feature implementation details? If YES → Move to feature layer
- [ ] Can this code work with ANY feature configuration? If NO → It's not truly shared

**Example Red Flag:**

```typescript
// ❌ BAD: Hard-coded feature knowledge
if (action.type.startsWith("listPreferences/")) {
}

// ✅ GOOD: Configurable
if (
  config.slicesToPersist.some((slice) => action.type.startsWith(`${slice}/`))
) {
}
```

### Before Writing Tests

**Test Agnosticism Check:**

- [ ] Do my tests reference specific feature names? If YES → Use generic test data
- [ ] Are test values hard-coded feature properties (e.g., `sortByHeight`)? If YES → Use generic names
- [ ] Do tests prove the code works with ANY input, not just current features? If NO → Refactor tests
- [ ] Are tests for shared infrastructure fully feature-agnostic? If NO → Fix immediately

**Example Red Flag:**

```typescript
// ❌ BAD: Feature-specific test data
const SLICES_TO_PERSIST = ["listPreferences"];
mockState = { listPreferences: { sortByHeight: true } };

// ✅ GOOD: Generic test data
const SLICES_TO_PERSIST = ["testSlice"];
mockState = { testSlice: { testProp: true } };
```

**No Feature-Specific Details Check:**

- [ ] Are action types hard-coded as `'featureName/action'`? If YES → Use generic names
- [ ] Are state shapes tied to specific features? If YES → Use generic object structures
- [ ] Could a colleague understand the test without knowing about Pokemon features? If NO → Make it generic

### Before Writing Feature Code

**Architecture Check:**

- [ ] Am I putting business logic in components? If YES → Move to hooks/use-cases
- [ ] Am I directly accessing infrastructure in components? If YES → Move to hooks
- [ ] Are my components humble (only orchestrating hooks)? If NO → Extract logic
- [ ] Did I follow TDD (tests first, then code)? If NO → Write tests now

**Dependency Injection Check:**

- [ ] Am I hard-coding dependencies instead of passing them? If YES → Add DI
- [ ] Can I test this without rendering React? If NO → Add DI
- [ ] Are dependencies configurable? If NO → Add configuration parameter

**Example Red Flag:**

```typescript
// ❌ BAD: Hard-coded dependency
const repository = new HttpPokemonRepository();

// ✅ GOOD: Injected dependency
function usePokemonList(repository: PokemonRepository) {}
```

### Quick Implementation Ritual

Before you start coding:

1. **Read relevant constraints** - What rules apply to this code?
2. **State them explicitly** - Write down which constraints you must follow
3. **Design for those constraints** - Shape your code to satisfy them
4. **Implement with verification** - After writing, verify constraint compliance

This ritual takes 2 minutes but prevents hours of rework.

## YAGNI Principle (You Aren't Gonna Need It)

**Core Rule:** Only implement what is **strictly necessary** to solve the current problem. Stay within scope.

**What we build:**

- ✅ Features explicitly requested or required
- ✅ Infrastructure for scalability, flexibility, and agnosticism (e.g., configuration-based middleware)
- ✅ Risk mitigation (error handling, validation)

**What we DON'T build:**

- ❌ "Nice to have" features
- ❌ Speculative functionality ("we might need this later")
- ❌ Extra actions, selectors, or helpers not currently used
- ❌ Abstractions before they're needed

**Example - Redux Slice:**

```typescript
// ❌ BAD: Over-engineered for future use
export const slice = createSlice({
  name: "preferences",
  initialState: { sortByHeight: false, sortByName: false, theme: "light" },
  reducers: {
    toggleSortByHeight: (state) => {
      state.sortByHeight = !state.sortByHeight;
    },
    toggleSortByName: (state) => {
      state.sortByName = !state.sortByName;
    }, // NOT NEEDED
    setSortByHeight: (state, action) => {
      state.sortByHeight = action.payload;
    }, // NOT NEEDED
    resetPreferences: () => initialState, // NOT NEEDED
    setTheme: (state, action) => {
      state.theme = action.payload;
    }, // NOT NEEDED
  },
});

// ✅ GOOD: Only what we need NOW
export const slice = createSlice({
  name: "preferences",
  initialState: { sortByHeight: false },
  reducers: {
    toggleSortByHeight: (state) => {
      state.sortByHeight = !state.sortByHeight;
    },
    // Add more ONLY when requirements arrive
  },
});
```

**When to add more:**

- When a new requirement explicitly asks for it
- Not before

**Benefits:**

- Less code to maintain
- Faster implementation
- Easier to test
- Simpler to understand
- No unused code

## Custom Virtual Scrolling System

The application features a sophisticated responsive virtual scrolling implementation optimized for grid layouts.

### Architecture

**Core Logic**: `VirtualGridCalculator` (framework-agnostic)

- Calculates visible items based on scroll position
- Responsive column calculation (2/3/5 columns)
- Position calculation with transform for performance

**React Integration**: `useVirtualGridList` hook

- Listens to `window.scroll` and `window.resize`
- Uses browser native scrolling (not container scrolling)
- Memoized for performance

### Configuration

Located in `src/features/pokemon-list/domain/constants.ts`:

```typescript
export const pokemonListConfig = {
  gap: 16, // Pixels between items
  itemHeight: 200, // Item height in pixels
  overscan: 5, // Extra items rendered outside viewport
};

export const responsiveBreakpoints = {
  desktopMinWidth: 768, // ≥768px = 5 columns
  tabletMinWidth: 640, // ≥640px = 3 columns
  mobileColumns: 2, // <640px = 2 columns
};
```

### Performance Characteristics

- Only renders visible items + overscan buffer (5 items)
- Handles 100+ items without performance degradation
- Maintains 60fps scrolling
- Memory efficient (no off-screen DOM nodes)

## Data Flow

```
User Action → Component → Hook → Use Case → Repository (port) →
HTTP Adapter → Fetch API → PokeAPI → DTO Mapping → Domain Entity →
React State → UI Render
```

### API Integration Pattern

1. `FetchHttpClient` wraps native fetch API
2. `HttpPokemonRepository` uses `HttpClient` to fetch data
3. `GetPokemonListUseCase` orchestrates:
   - Calls `repository.findAllByType(type)` for Pokemon list
   - Maps each to get details via `repository.findDetailsByName(name)`
   - Uses `Promise.all()` for parallel fetching
   - Maps DTOs to domain entities via `mapToDomainList()`
4. Error handling propagates through layers

## Testing Strategy

### Two-Layer Testing Philosophy

We employ a **dual-layer testing approach** that balances fast development feedback with high user-facing confidence:

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: Integration Tests (Primary Confidence)       │
│  Purpose: Verify user-facing behavior                  │
│  Location: src/pages/{Page}/__tests__/                 │
│  Tools: render(), screen, userEvent                    │
│  Focus: "Does the feature work for users?"             │
└─────────────────────────────────────────────────────────┘
                           ↓
              Detects: "Feature is broken"
                           ↓
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: Unit Tests (Development & Debugging Aid)     │
│  Purpose: TDD development + bug isolation              │
│  Location: Feature/domain/application/infrastructure   │
│  Tools: Direct function calls, renderHook()            │
│  Focus: "Which specific logic broke?"                  │
└─────────────────────────────────────────────────────────┘
```

**Why Two Layers?**

**Integration tests alone** provide confidence but:

- ❌ Slow feedback during TDD development
- ❌ Harder to isolate bugs (component vs hook vs repository)
- ❌ Difficult to test edge cases requiring complex UI setup

**Unit tests** complement integration tests by:

- ✅ Enabling fast TDD red-green-refactor cycles
- ✅ Pinpointing exact failure location (hook logic vs component)
- ✅ Testing edge cases without complex UI interactions
- ✅ Verifying performance characteristics (large datasets)

**Both layers together** provide:

- ✅ Fast development (unit tests)
- ✅ High confidence (integration tests)
- ✅ Efficient debugging (layered isolation)

### Test Organization

Tests are co-located with source code in `__tests__/` directories.

### Mock Organization and Scoping

**Rule: Mocks are scoped at feature or page level, never scattered across individual test files.**

Feature-level mocks must be consolidated in a single `__tests__/mocks.ts` file at the feature root. Page-level mocks are scoped to `pages/{page}/__tests__/mocks.ts` for UI-specific test data.

**Benefits:**

1. **Single Source of Truth**: All domain entity mocks for a feature in one place
2. **Consistency**: Tests use the same mock instances, preventing divergence
3. **Maintainability**: Update mock data in one location
4. **Discoverability**: New contributors know where to find/add mocks
5. **Reusability**: Easy to share mocks across multiple test files in the feature

**Directory Structure:**

```
feature/
├── __tests__/
│   ├── mocks.ts                    ← Feature-level mocks (all domain entities for this feature)
├── domain/
│   └── entities/
├── application/
│   ├── use-cases/
│   │   └── use-case-name/
│   │       ├── UseCase.ts
│   │       └── __tests__/
│   │           └── UseCase.test.ts  ← Imports mocks from feature-level
│   └── hooks/
│       └── __tests__/
│           └── hook.test.ts         ← Imports mocks from feature-level
└── infrastructure/

pages/
├── Page/
│   └── __tests__/
│       ├── Page.test.tsx
│       ├── setupTests.ts           ← Page-level fetch mocks
│       └── mocks.ts                ← Page-level UI test data
```

**Feature-Level Mocks** (`src/features/{feature}/__tests__/mocks.ts`):

Use when testing domain entities, use cases, and hooks within a feature. Export named, descriptive mock instances of domain entities:

```typescript
// Pattern: export const mock{EntityType}{Variant} = new Entity(...)
export const mockEntityItemA = new Entity(/* constructor args */);
export const mockEntityItemB = new Entity(/* different constructor args */);

export const mockValueObjectA = new ValueObject(/* args */);
export const mockValueObjectB = new ValueObject(/* different args */);
```

Then import in any test file within the feature. The benefit is all tests within the feature share the same mock instances, preventing divergence.

**Page-Level Mocks** (`src/pages/{page}/__tests__/mocks.ts`):

Use for HTTP response mocks and UI-specific test data. Export raw API response shapes (DTOs):

```typescript
// Pattern: export const {operation}{variant}Mock = { /* raw API response */ }
export const apiResponseMock = {
  id: "123",
  name: "item",
  // ... other API fields
};
```

Setup fetch mocks in the page's `setupTests.ts`:

```typescript
// Pattern: Mock fetch to return your HTTP response mocks
import { apiResponseMock } from "./mocks";

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url.includes("/api/endpoint")) {
      return Promise.resolve({
        ok: true,
        json: async () => apiResponseMock,
      });
    }
    // ... handle other endpoints
  });
});
```

**Important:** When adding new tests, always check if a mock already exists in the appropriate `__tests__/mocks.ts` before creating new ones. Keep mocks centralized in one place per layer to maintain consistency.

### Testing Pyramid

**Test Structure (TDD Foundation + Integration Safeguard):**

```
┌────────────────────────────────────────┐
│   UNIT TESTS (Foundation of TDD)       │
│   ────────────────────────────────────│
│   - Domain Layer (pure logic)          │
│   - Application Layer (use cases, VMs) │
│   - Infrastructure (adapters, calcs)   │
│                                        │
│   No framework dependencies            │
│   Test in isolation with mocks         │
│   Fast execution                       │
│   100% code coverage target            │
└────────────────────────────────────────┘
              ↑
              │
┌────────────────────────────────────────┐
│   INTEGRATION TESTS (Outside-In)       │
│   ────────────────────────────────────│
│   - Pages (React components)           │
│   - Mocked HTTP/External APIs          │
│                                        │
│   Integration safeguard on UI layer    │
│   Tests from user perspective          │
│   Ensures feature pieces work together │
│   No E2E tools (Cypress, Selenium)     │
└────────────────────────────────────────┘

**Why No E2E Tests:**
- UI integration tests from pages provide sufficient safeguard
- TDD approach with unit tests catches logic errors early
- Pages tests verify component composition works correctly
- External E2E tools add complexity without proportional value
```

### Testing Constraint: Blackbox Principle

**Do NOT test blackboxes, browser APIs, or third-party libraries.**

We only test **our implementation decisions** and **our project code**. Never test:

- ❌ Browser APIs (localStorage, sessionStorage, fetch, etc.)
- ❌ Third-party libraries (Redux, React Router, Tailwind, etc.)
- ❌ Framework internals (Redux dispatch, state updates, reducers)
- ❌ Library behavior

**Instead, mock them completely:**

- ✅ Mock browser APIs: `vi.spyOn(Storage.prototype, 'setItem')`
- ✅ Mock Redux internals: mock `store`, `next`, `action`
- ✅ Test only that we call them with correct parameters
- ✅ Test that we handle errors they might throw
- ✅ Test our code's logic, not their code's logic

**Example (Wrong):**

```typescript
// ❌ This tests localStorage's JSON behavior, not our code
localStorage.setItem("key", JSON.stringify(data));
const loaded = JSON.parse(localStorage.getItem("key"));
expect(loaded).toEqual(data); // Tests JSON + localStorage
```

**Example (Correct):**

```typescript
// ✅ This tests only our code's behavior
const setItemSpy = vi
  .spyOn(Storage.prototype, "setItem")
  .mockImplementation(() => {});
myFunction();
expect(setItemSpy).toHaveBeenCalledWith("key", JSON.stringify(data)); // Tests our code
```

**TDD Workflow:**

1. Write unit test first (Red phase)
2. Implement minimal code to pass test (Green phase)
3. Refactor while tests remain green (Refactor phase)
4. Repeat for all layers
5. Integration tests from pages verify composition

## Complete TDD Workflow for Hexagonal Architecture Refactoring

When refactoring an existing feature to Hexagonal Architecture, follow this **layer-by-layer approach**. Apply TDD selectively based on complexity.

### Prerequisites (Must Be True):

- ✅ Page integration test exists and passes
- ✅ Feature works in production (logic in view/component)
- ✅ You understand what logic needs extraction

### The Complete Refactoring Sequence:

```
┌─────────────────────────────────────────────────────────────┐
│ EXISTING STATE: Feature works but violates architecture    │
│ ✅ Page Test: PASSES                                        │
│ ✅ View: Has all logic inline (services, fetch calls)      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: DOMAIN LAYER (Entities & Value Objects)           │
│                                                             │
│ Step 1: Create entity class      │
│ Step 2: Define repository port (interface only)            │
│                                                             │
│ ⚠️  NO TESTS - If entities are still too simple (data containers)   │
│ ✅ Page test: STILL PASSES (no changes to view yet)        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: INFRASTRUCTURE LAYER (Repository Adapter)         │
│                                                             │
│ Step 3: RED - Write repository test (mock HTTP client)     │
│ Step 4: GREEN - Implement repository                       │
│ Step 5: REFACTOR - Add error handling, edge cases          │
│                                                             │
│ ✅ Repository tests: PASS (TDD starts here)                │
│ ✅ Page test: STILL PASSES (view not using repo yet)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: APPLICATION LAYER (Use Case)                      │
│                                                             │
│ Step 6: RED - Write use case test (mock repository)        │
│ Step 7: GREEN - Implement use case                         │
│ Step 8: REFACTOR - Add orchestration logic                 │
│                                                             │
│ ✅ Use case tests: PASS                                     │
│ ✅ Page test: STILL PASSES (view not using use case yet)   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: APPLICATION LAYER (ViewModel - Optional)          │
│                                                             │
│ Step 9: RED - Write view model test           │
│ Step 10: GREEN - Implement view model                      │
│ Step 11: REFACTOR - Add data transformation logic          │
│                                                             │
│ ✅ ViewModel tests: PASS (if created)                      │
│ ✅ Page test: STILL PASSES                                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: INFRASTRUCTURE LAYER (React Hook)                 │
│                                                             │
│ Step 12: RED - Write hook test (mock repository)           │
│ Step 13: GREEN - Extract logic from view to hook           │
│ Step 14: Update view to use hook                           │
│ Step 15: REFACTOR - Simplify hook                          │
│                                                             │
│ ✅ Hook tests: PASS                                         │
│ ✅ Page test: STILL PASSES ⚠️ (CRITICAL - verify!)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ FINAL STATE: Feature refactored to Hexagonal Architecture  │
│ ✅ Page Test: STILL PASSES (no regression)                 │
│ ✅ Unit Tests: PASS (Repository, Use Case, ViewModel, Hook)│
│ ✅ Architecture: Clean separation of concerns               │
│ ⚠️  Domain entities: No tests (YAGNI - too simple)         │
└─────────────────────────────────────────────────────────────┘
```

### When to Test Domain Layer:

**TDD Rule: Test behavior, not data containers.**

#### ✅ WRITE TESTS (TDD) When Domain Entities Have Behavior:

Domain entities or value objects with **methods containing logic** require TDD:

**Examples requiring tests:**

```typescript
// ✅ HAS BEHAVIOR → WRITE TESTS FIRST (TDD)
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly height: number,
    public readonly imageUrl: string
  ) {}

  // ← BEHAVIOR: Conditional logic
  getSizeCategory(): "small" | "medium" | "large" {
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }

  // ← BEHAVIOR: Business rule
  isBossTier(): boolean {
    return this.height > 30;
  }
}

// Test FIRST (RED-GREEN-REFACTOR)
it("classifies pokemon by size category based on height", () => {
  const small = new PokemonListItem("1", "pikachu", 4, "url");
  const medium = new PokemonListItem("2", "charizard", 17, "url");
  const large = new PokemonListItem("3", "onix", 88, "url");

  expect(small.getSizeCategory()).toBe("small");
  expect(medium.getSizeCategory()).toBe("medium");
  expect(large.getSizeCategory()).toBe("large");
});
```

**When to write domain tests:**

- Methods with conditionals (`if/else`, `switch`)
- Business rules (validation beyond type checking)
- Calculations or transformations
- Derived properties
- Comparisons (`equals()`, `isSameAs()`)

**TDD Workflow:**

1. RED: Write test for entity behavior first
2. GREEN: Implement minimal code to pass test
3. REFACTOR: Clean up while tests stay green

---

#### ❌ SKIP TESTS When Domain Entities Are Simple Data Containers:

**Current state (pokemon-list example):**

```typescript
// ❌ NO BEHAVIOR → NO TESTS (YAGNI)
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly height: number,
    public readonly imageUrl: string
  ) {}
  // No methods, no logic, just data storage
}
```

**Entities without tests:**

- `PokemonListItem` - Plain data container (no methods)
- `PokemonType` - Simple validation only (no behavior methods)
- `PokemonReference` - Plain data container (no methods)
- `PokemonByName` - Plain data container (no methods)

**Why no domain tests:**

- Entities are plain data containers (only constructor + readonly fields)
- No methods beyond constructor
- No business logic to test
- Constructors only assign properties
- Tests would only verify TypeScript's type system
- YAGNI applies: don't test what doesn't exist

**When entities are this simple:**

- Skip domain tests entirely
- Tests START at Repository layer (first place with actual logic: HTTP calls, DTO mapping, error handling)

---

#### 📋 Decision Table: Should I Test This Entity?

| Entity Characteristic              | Has Tests? | Why?                                   |
| ---------------------------------- | ---------- | -------------------------------------- |
| Only constructor + readonly fields | ❌ No      | No behavior to test (YAGNI)            |
| Has validation in constructor      | ❌ No\*    | TypeScript already enforces types      |
| Has methods with conditionals      | ✅ Yes     | Behavior needs verification (TDD)      |
| Has business rule methods          | ✅ Yes     | Logic correctness is critical (TDD)    |
| Has calculations                   | ✅ Yes     | Math needs edge case testing (TDD)     |
| Has derived properties (getters)   | ✅ Yes     | Transformation logic needs tests (TDD) |

\*Exception: Complex validation (e.g., DNI check digit, email format with normalization) DOES need tests.

---

#### 🔄 Evolution Path: From Simple to Rich Entities

Entities can evolve from simple to rich as features grow:

```typescript
// PHASE 1: Simple entity (NO tests)
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly height: number,
    public readonly imageUrl: string
  ) {}
}

// ⬇️ NEW FEATURE REQUEST: "Show size badge on each Pokemon card"

// PHASE 2: Rich entity (NOW needs tests - write FIRST)
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly height: number,
    public readonly imageUrl: string
  ) {}

  // NEW: Added behavior → Write test FIRST (TDD)
  getSizeCategory(): "small" | "medium" | "large" {
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }
}

// Test written FIRST (RED), then implementation (GREEN)
it("returns correct size category for small pokemon", () => {
  const pikachu = new PokemonListItem("1", "pikachu", 4, "url");
  expect(pikachu.getSizeCategory()).toBe("small");
});
```

**Key Principle:** Start simple (no tests), add behavior with TDD when needed (test first).

---

**Summary:**

- ✅ Domain entities with **behavior** (methods with logic) → Write tests FIRST (TDD)
- ❌ Domain entities as **data containers** (no methods) → Skip tests (YAGNI)
- 🔄 When adding behavior to simple entity → Write test FIRST, then add method (TDD)
- 📍 Tests always START at Repository layer for simple entities (first actual logic layer)

### Critical Rules:

1. **Page test MUST stay green** throughout the entire refactoring
2. **Apply TDD selectively** - Test complex logic, skip simple data containers (YAGNI)
3. **Don't skip tested layers** - Repository, Use Case, ViewModel, and Hook need tests
4. **Start from domain** (innermost) and work outward to infrastructure
5. **Hook is LAST** - only after repository and use case exist

### Lean TDD Checklist: Refactoring to Hexagonal Architecture

Use this checklist for a lean, practical refactoring approach:

#### Phase 1: Domain Layer (No Tests - YAGNI)

- [ ] Create simple entity class (data container only)
- [ ] Define repository port (interface)
- [ ] ⚠️ **Skip tests** - Entities are too simple

#### Phase 2: Infrastructure (Repository) (RED → GREEN → REFACTOR)

- [ ] RED: Write repository test with mocked HTTP client
- [ ] GREEN: Implement repository (map DTOs to entities)
- [ ] REFACTOR: Add error handling, edge cases

#### Phase 3: Application Layer (Use Case) (RED → GREEN → REFACTOR)

- [ ] RED: Write use case test with mocked repository
- [ ] GREEN: Implement use case (orchestrate repository calls)
- [ ] REFACTOR: Add error handling

#### Phase 4: Application Layer (ViewModel - Optional)

- [ ] RED: Write view model test (if needed for data transformation)
- [ ] GREEN: Implement view model
- [ ] REFACTOR: Simplify transformations

#### Phase 5: Infrastructure (Hook) (RED → GREEN → REFACTOR)

- [ ] RED: Write hook test with mocked repository
- [ ] GREEN: Extract logic from view to hook
- [ ] Update view to use hook
- [ ] **VERIFY PAGE TEST STILL PASSES** ⚠️ (critical!)
- [ ] REFACTOR: Simplify hook

#### ✅ Post-Refactoring Verification:

- [ ] Repository tests pass
- [ ] Use case tests pass
- [ ] ViewModel tests pass (if created)
- [ ] Hook tests pass
- [ ] Page integration test STILL passes
- [ ] No regression in user-facing behavior

### Real-World Example: pokemon-list Feature

See `src/features/pokemon-list/` for a complete example of Hexagonal Architecture with selective TDD:

**Domain Layer:**

- ⚠️ **NO TESTS** - Entities are simple data containers (YAGNI)
- `domain/entities/PokemonListItem.ts` - Simple class, no tests
- `domain/value-objects/PokemonType.ts` - Simple validation, no tests

**Infrastructure Layer (Repository):**

- ✅ `infrastructure/http/__tests__/HttpPokemonRepository.test.ts` - Repository tests (HTTP adapter, DTO mapping)

**Application Layer:**

- ✅ `application/use-cases/get-pokemon-list/__tests__/GetPokemonListUseCase.test.ts` - Use case tests (orchestration)
- ✅ `application/view-models/__tests__/PokemonListViewModel.test.ts` - View model tests (data preparation)

**Infrastructure Layer (React):**

- ✅ `infrastructure/react/hooks/__tests__/usePokemonList.test.ts` - Hook tests (React integration)
- ✅ `infrastructure/react/hooks/__tests__/usePokemonList.isLoading.test.ts` - Hook tests (loading states)
- ✅ `infrastructure/react/hooks/__tests__/usePokemonList.isError.test.ts` - Hook tests (error states)

**UI Layer:**

- ✅ `src/pages/Home/__tests__/Home.test.tsx` - Integration tests (user perspective)

**Each file shows the RED-GREEN-REFACTOR cycle applied to that specific layer.**

### Refactoring-Driven Development: Hook Extraction Workflow (Phase 5)

**Important: This section describes ONLY Phase 5 (hook extraction). You must complete Phases 1-4 first.**

**Critical: Hooks are extracted AFTER satisfying user stories AND after creating domain/repository/use-case layers.**

We follow a **refactoring-driven approach** where logic is first implemented in views to satisfy user requirements, then extracted layer-by-layer (domain → repository → use case → hook).

**The Hook Extraction Workflow (Assumes Phases 1-4 Complete):**

```
Prerequisites: Entity exists, Repository exists, Use Case exists
↓
Hook Test (RED) → Extract to Hook (GREEN) → View uses Hook → Refactor
```

**Step-by-Step Process:**

```
Prerequisites (Already Complete):
✅ Domain entities exist with tests
✅ Repository exists with tests
✅ Use case exists with tests
✅ Page test passes with logic in view

1. RED: Write hook unit test for extraction
   └─> Test fails because hook doesn't exist yet
   └─> Test describes the hook API and behavior
   └─> Test uses mocked repository (from Phase 2)

2. GREEN: Extract logic from view into hook
   └─> Hook test passes
   └─> Hook uses repository and use case (dependency injection)

3. Update view to use hook
   └─> Page test STAYS GREEN (no regression)
   └─> Logic now reusable and testable in isolation

4. REFACTOR: Simplify hook and view
   └─> All tests stay green
```

**Key Principle:** The page test must NEVER go RED during hook extraction. If it does, you've broken the feature.

**Complete Example: Extracting usePokemonList Hook (Phase 5 Only)**

**Prerequisites (Phases 1-4 Already Complete):**

```typescript
// ✅ Phase 1: Entity exists
class PokemonListItem {
  constructor(
    public id: string,
    public name: string,
    public height: number
  ) {}
}

// ✅ Phase 2: Repository exists
interface PokemonRepository {
  findAllByType(type: PokemonType): Promise<PokemonListItem[]>;
}

// ✅ Phase 3: Use case exists
class GetPokemonListUseCase {
  constructor(private repository: PokemonRepository) {}
  async execute(type: string): Promise<PokemonListItem[]> {
    /* ... */
  }
}

// ✅ Page test passes with logic in view
```

**Example: Extracting usePokemonList Hook**

**Step 1: RED - Write page-level test (user story)**

```typescript
// src/pages/Home/__tests__/Home.test.tsx

it("displays pokemon list when user selects a type", async () => {
  render(<Home />);

  const typeSelector = screen.getByRole('combobox', { name: /type/i });
  await userEvent.selectOptions(typeSelector, 'grass');

  // ❌ FAILS - feature doesn't exist yet
  await waitFor(() => {
    expect(screen.getByText('Bulbasaur')).toBeInTheDocument();
    expect(screen.getByText('Ivysaur')).toBeInTheDocument();
  });
});
```

**Step 2: GREEN - Implement in view directly with inline logic**

```typescript
// src/pages/Home/Home.tsx

export function Home() {
  const [selectedType, setSelectedType] = useState('grass');
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Logic implemented directly in component (works but violates architecture)

  useEffect(() => {
    const fetchPokemon = async () => {
      setIsLoading(true);
      const repository = new HttpPokemonRepository(httpClient);
      const pokemonsByType = await repository.findAllByType(new PokemonType(selectedType));

      const details = await Promise.all(
        pokemonsByType.map(p => repository.findDetailsByName(p.name))
      );

      setPokemonList(details.map((d, i) =>
        new PokemonListItem(i, d.name, d.height, d.imageUrl)
      ));
      setIsLoading(false);
    };

    if (selectedType) fetchPokemon();
  }, [selectedType]);

  return (
    <div>
      <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
        <option value="grass">Grass</option>
      </select>
      {isLoading ? <p>Loading...</p> : pokemonList.map(p => <div>{p.name}</div>)}
    </div>
  );
}


// ✅ Page test now PASSES - feature works for users
```

**Step 3: RED - Write hook unit test**

```typescript
// src/features/pokemon-list/infrastructure/react/hooks/__tests__/usePokemonList.test.ts

it("loads pokemon list for selected type", async () => {
  const mockRepository = createMockPokemonRepository();

  // ❌ FAILS - hook doesn't exist yet
  const { result } = renderHook(() => usePokemonList("grass", mockRepository));

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.pokemonList.length).toBe(2);
  expect(result.current.pokemonList[0].name).toBe("bulbasaur");
});
```

**Step 4: GREEN - Extract logic to hook**

```typescript
// src/features/pokemon-list/infrastructure/react/hooks/usePokemonList.ts

export function usePokemonList(
  selectedType: string,
  repository: PokemonRepository
) {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPokemon = async () => {
      setIsLoading(true);
      const pokemonsByType = await repository.findAllByType(
        new PokemonType(selectedType)
      );

      const details = await Promise.all(
        pokemonsByType.map((p) => repository.findDetailsByName(p.name))
      );

      setPokemonList(
        details.map(
          (d, i) => new PokemonListItem(i, d.name, d.height, d.imageUrl)
        )
      );
      setIsLoading(false);
    };

    if (selectedType) fetchPokemon();
  }, [selectedType, repository]);

  return { pokemonList, isLoading };
}

// ✅ Hook test now PASSES
```

**Step 5: Refactor view to use hook**

```typescript
// src/pages/Home/Home.tsx

export function Home() {
  const [selectedType, setSelectedType] = useState('grass');
  const repository = useMemo(() => new HttpPokemonRepository(httpClient), []);

  // Use extracted hook
  const { pokemonList, isLoading } = usePokemonList(selectedType, repository);

  return (
    <div>
      <select value={selectedType} onChange={e => setSelectedType(e.target.value)}>
        <option value="grass">Grass</option>
      </select>
      {isLoading ? <p>Loading...</p> : pokemonList.map(p => <div>{p.name}</div>)}
    </div>
  );
}

// ✅ Page test STILL PASSES (no regression)
// ✅ Hook test PASSES (logic isolated)
// ✅ Logic now reusable across components
```

**Benefits of This Approach:**

1. **User-Story First**: Page test ensures we're building the right feature
2. **Fast Feedback**: Get feature working quickly in view
3. **Safe Refactoring**: Hook extraction doesn't break existing functionality
4. **Both Layers Pass**: Integration + unit tests both green after extraction
5. **Reusability**: Hook can now be used in other components
6. **Testability**: Complex logic testable in isolation via hook tests

**When NOT to Extract a Hook:**

- Logic is too simple (< 10 lines, no conditionals)
- Logic is used in only one place and won't be reused
- Logic is tightly coupled to specific component UI state

**When TO Extract a Hook:**

- Logic is complex (filtering, sorting, transformations)
- Logic will be reused across multiple components
- Logic involves async operations with loading/error states
- Logic needs isolated unit testing for TDD

### Testing Patterns by Layer

**Domain Layer** - Test behavior only (if it exists):

- ✅ **IF entity has behavior**: Test methods with logic directly (no mocks, no framework)
- ❌ **IF entity is simple data container**: Skip tests (YAGNI)
- Tests run instantly (pure functions)
- Example (when entity HAS behavior): `expect(entity.getSizeCategory()).toBe("large")`
- **Current project**: Domain entities are simple containers → No domain tests

**Application Layer (Use Cases)** - Mock port interfaces:

- Inject mock repository implementations
- Test orchestration and business logic
- Mock only the ports defined in domain
- Example: Mock repository's `findAll()` method, test use case coordinates calls correctly

**Application Layer (ViewModels)** - Mock repository, test preparation:

- Inject mock repository
- Test input validation and data transformation
- Test coordination of multiple use cases
- Example: Mock repository, test ViewModel validates inputs before calling use cases

**Infrastructure Layer (Adapters)** - Mock external dependencies:

- HTTP: Mock `fetch` or HTTP client responses
- Browser APIs: Mock `window.scrollY`, `window.resize`, etc.
- Storage: Mock localStorage, sessionStorage
- Example: `global.fetch = vi.fn().mockResolvedValue({ json: async () => mockData })`

**React Hooks (Thin Adapters)** - Use React Testing Library:

- Test hook with mocked repository
- Use `renderHook` from React Testing Library
- Verify hook exposes correct state and callbacks
- Example: `renderHook(() => useFeature(mockRepository))`
- **When to write**: After extracting logic from view (refactoring-driven)
- **Purpose**: Enable TDD for complex logic, aid debugging when page tests fail

**Pages (UI Components)** - Integration tests from user perspective:

- Mock HTTP responses in `setupTests.ts`
- Test page composition of multiple hooks
- Verify user interactions trigger correct behavior
- Example: User selects type → list updates → items visible
- **When to write**: FIRST (before implementing feature)
- **Purpose**: Define user acceptance criteria, ensure feature works end-to-end

### When to Write Hook Unit Tests (Decision Guide)

**Philosophy:** Hook tests are **not mandatory**—they serve specific purposes. Write them strategically.

#### ✅ WRITE Hook Unit Tests When:

**1. Complex Business Logic**

- Filtering algorithms with multiple conditions
- Sorting logic with edge cases
- Data transformations (mapping, reducing, aggregating)
- Calculations or computations
- State machines with multiple transitions

**Example:**

```typescript
// ✅ Complex filtering - WRITE hook unit test
export function usePokemonList(type, repository, options) {
  const filtered = pokemonList.filter(pokemon => {
    const matchesSearch = !options?.searchTerm ||
      pokemon.name.toLowerCase().includes(options.searchTerm.toLowerCase());

    const matchesHeight = !options?.minHeight ||
      pokemon.height >= options.minHeight;

    const matchesType = !options?.excludeTypes?.includes(pokemon.primaryType);

    return matchesSearch && matchesHeight && matchesType;
  });

  return { pokemonList: filtered, ... };
}
```

**Why:** Multiple conditions are easier to test in isolation than through UI.

---

**2. Async State Management**

- Loading states with race conditions
- Error recovery and retry logic
- Debouncing/throttling
- Cancellation of pending requests
- Optimistic updates with rollback

**Example:**

```typescript
// ✅ Complex async handling - WRITE hook unit test
export function usePokemonList(type, repository) {
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchWithRetry = async () => {
      try {
        const data = await repository.findAllByType(type);
        if (!cancelled) setPokemonList(data);
      } catch (err) {
        if (!cancelled && retryCount < 3) {
          setRetryCount((prev) => prev + 1);
          setTimeout(fetchWithRetry, 1000 * retryCount);
        } else {
          setError(err);
        }
      }
    };

    fetchWithRetry();
    return () => {
      cancelled = true;
    };
  }, [type, retryCount]);
}
```

**Why:** Testing retry logic, cancellation, and race conditions is difficult through UI.

---

**3. Performance-Critical Code**

- Large datasets (1000+ items)
- Virtual scrolling calculations
- Memoization strategies
- Optimization algorithms

**Example:**

```typescript
// ✅ Performance-critical - WRITE hook unit test
export function useVirtualGridList({ items, itemHeight, containerHeight }) {
  const calculateVisibleItems = useCallback(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.ceil((scrollTop + containerHeight) / itemHeight);
    return items.slice(startIndex, endIndex);
  }, [items, itemHeight, containerHeight, scrollTop]);

  return { visibleItems: calculateVisibleItems() };
}
```

**Why:** Need to verify calculations work with 10k+ items without rendering DOM.

---

**4. Edge Cases Hard to Reproduce via UI**

- Empty states
- Null/undefined handling
- Rapid state changes
- Concurrent operations
- Boundary conditions

**Example:**

```typescript
// ✅ Edge case handling - WRITE hook unit test
it("handles repository returning null gracefully", async () => {
  const mockRepository = {
    findAllByType: vi.fn().mockResolvedValue(null),
  };

  const { result } = renderHook(() => usePokemonList("grass", mockRepository));

  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.pokemonList).toEqual([]);
  expect(result.current.error).toBeNull();
});
```

**Why:** Setting up UI to trigger null response is complex; hook test is simpler.

---

**5. Refactoring-Driven Hook Extraction**

- You implemented logic in view first
- Now extracting to hook for reusability
- Need isolated tests to verify extraction didn't break logic

**Example Workflow:**

```
1. Page test passes with logic in view
2. Write hook unit test (defines extracted behavior)
3. Extract logic to hook
4. Hook test passes + page test stays green
```

**Why:** Hook test ensures extraction is correct; page test prevents regressions.

---

#### ❌ SKIP Hook Unit Tests When:

**1. Simple Pass-Through Hook**

```typescript
// ❌ NO unit test needed - too simple
export function useRepository() {
  return useMemo(() => new HttpPokemonRepository(httpClient), []);
}

// ✅ Only integration test
it("loads pokemon from API", async () => {
  render(<Home />);
  await waitFor(() => expect(screen.getByText('Bulbasaur')).toBeInTheDocument());
});
```

**Why:** No logic to test; integration test covers functionality.

---

**2. Hook with No Conditionals**

```typescript
// ❌ NO unit test needed - no branching logic
export function usePokemonType(initialType) {
  const [selectedType, setSelectedType] = useState(initialType);
  return { selectedType, setSelectedType };
}

// ✅ Only integration test
it("updates list when user changes type", async () => {
  render(<Home />);
  await userEvent.selectOptions(screen.getByRole('combobox'), 'fire');
  expect(screen.getByText('Charmander')).toBeInTheDocument();
});
```

**Why:** Trivial state management; integration test is sufficient.

---

**3. Already Fully Covered by Integration Tests**

```typescript
// ❌ Skip if integration tests verify all paths
export function usePokemonList(type, repository) {
  const [list, setList] = useState([]);

  useEffect(() => {
    repository.findAllByType(type).then(setList);
  }, [type]);

  return { pokemonList: list };
}

// ✅ Integration tests already cover:
// - Initial load
// - Type changes
// - Error handling
// Therefore: No hook unit test needed
```

**Why:** No additional value from unit test if integration tests cover all scenarios.

---

**4. Trivial Hook (< 10 Lines, No Logic)**

```typescript
// ❌ Too trivial for unit test
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Why:** Standard React pattern; integration test verifies it works in context.

---

### Debugging Workflow: When Integration Tests Fail

**Step-by-Step Isolation:**

```
1. Integration test fails at page level
   └─> "updates pokemon list when user selects fire type" ❌

2. Check if corresponding hook unit test exists
   └─> "updates list when selectedType changes"

3a. Hook test EXISTS and PASSES ✅
    └─> Bug is in component layer (not hook logic)
    └─> Check: Is component passing correct props to hook?
    └─> Check: Is component rendering hook data correctly?
    └─> Check: Are event handlers wired correctly?

3b. Hook test EXISTS and FAILS ❌
    └─> Bug is in hook logic
    └─> Use hook test to debug in isolation (faster)
    └─> Fix: useEffect dependency array missing selectedType?
    └─> Fix: Repository not being called with new type?
    └─> Verify hook test passes → then verify page test passes

3c. Hook test DOESN'T EXIST
    └─> Write hook unit test now to isolate the issue
    └─> If hook test passes → bug in component
    └─> If hook test fails → bug in hook
    └─> Keep the hook test for future debugging
```

**Example Debugging Session:**

```typescript
// SCENARIO: Integration test fails
// Home.pokemon-type-updates.test.tsx
it("updates list when user selects fire type", async () => {
  render(<Home />);
  await userEvent.selectOptions(typeSelector, 'fire');
  // ❌ Expected "Charmander" but got "Bulbasaur" (list didn't update)
  expect(screen.getByText('Charmander')).toBeInTheDocument();
});

// STEP 1: Run corresponding hook test
// usePokemonList.test.ts
it("updates pokemon list when selectedType changes", async () => {
  const { result, rerender } = renderHook(
    ({ selectedType }) => usePokemonList(selectedType, mockRepository),
    { initialProps: { selectedType: "grass" } }
  );

  await waitFor(() => expect(result.current.pokemonList.length).toBe(2));

  rerender({ selectedType: "fire" });

  await waitFor(() => {
    expect(result.current.pokemonList[0].name).toBe("charmander"); // ❓
  });
});

// RESULT A: Hook test PASSES ✅
// → Hook logic works correctly
// → Bug must be in <Home /> component
// → Check: Is <Home /> passing selectedType to hook?
// → Found: <Home /> has stale selectedType in closure!
//   Fix: Add selectedType to useEffect dependencies

// RESULT B: Hook test FAILS ❌
// → Hook logic is broken
// → Debug hook in isolation (no component complexity)
// → Found: useEffect missing selectedType in dependency array!
//   Fix: Add selectedType to useEffect([selectedType, repository])
// → Hook test now passes → Page test now passes
```

### Test Configuration

Vitest uses `jsdom` environment with auto-discovered setup files:

- Automatically loads all `setupTests.ts` files via glob pattern
- Global test utilities available (`describe`, `it`, `expect`, `vi`)

## Test Writing Style Guide

### General Rules

1. **Descriptive Test Names**

   - Use `it()` with clear, descriptive names
   - Names should describe what behavior is being tested, not implementation
   - ✅ `it("returns empty array when selectedType is empty")`
   - ❌ `it("should work with empty string")`

2. **One Behavior Per Test**

   - Each test should verify a single behavior
   - If testing multiple properties, they should all relate to one behavior
   - Avoid testing multiple independent behaviors in one test

3. **AAA Pattern (Arrange, Act, Assert)**

   - Organize tests into three logical sections
   - Example:

   ```typescript
   it("updates pokemon list when selectedType changes", async () => {
     const newMockPokemonsByType = [...];
     const mockRepository = { ... };

     const { result, rerender } = renderHook(() => usePokemonList(selectedType, mockRepository));
     rerender({ selectedType: "fire" });

     await waitFor(() => {
       expect(result.current.pokemonList.length).toBe(1);
     });
   });
   ```

4. **Clear Comments for Complex Steps**

   - Add inline comments to explain non-obvious test logic
   - Comments should clarify "why" not "what"
   - ✅ `// Wait for the pokemon list to appear after clicking`
   - ❌ `// wait`

5. **Semantic DOM Queries**

   - Prefer `getByRole()`, `findByRole()` over `getByTestId()` or `getByText()`
   - Use `within()` to scope queries to relevant DOM elements
   - Use case-insensitive regex matching: `/fire/i`

   ```typescript
   const fireButton = within(selectTypeList).findByRole("button", {
     name: /fire/i,
   });
   ```

6. **Explicit Mock Setup**

   - Mock setup should clearly show the contract
   - Use `vi.fn()` with `.mockResolvedValue()` or `.mockRejectedValue()`
   - Order mock setup logically (often: arrange inputs → setup mocks → create object)

   ```typescript
   const mockRepository: PokemonRepository = {
     findAllByType: vi.fn().mockResolvedValue(testData.mockPokemonsByType),
     findDetailsByName: vi
       .fn()
       .mockResolvedValue(testData.mockPokemonsByName[0]),
   };
   ```

7. **Setup and Teardown with beforeEach/afterEach**

   - Use `beforeEach()` to setup test state that applies to all tests in a file
   - Use `afterEach()` to cleanup (mocks, window properties, etc.)
   - Common patterns:
     - Mock global fetch
     - Mock window properties (scrollY, innerWidth, etc.)
     - Setup test data structures

   ```typescript
   beforeEach(() => {
     Object.defineProperty(window, "scrollY", {
       writable: true,
       configurable: true,
       value: 0,
     });
   });

   afterEach(() => {
     vi.resetAllMocks();
   });
   ```

8. **Async/Await Patterns**

   - Use `async/await` for async tests
   - Wrap async assertions in `waitFor()` for React updates
   - Use `act()` when directly testing hook behavior changes

   ```typescript
   it("async test example", async () => {
     const { result } = renderHook(() => usePokemonList("grass", mockRepo));

     await waitFor(() => {
       expect(result.current.pokemonList.length).toBe(3);
     });
   });
   ```

9. **Test Data and Mocks Location**

   - Store shared test data in `setupTests.ts` or `mocks.ts` co-located in `__tests__/`
   - Name mock data descriptively: `mockRepository`, `charmanderMock`, `testData`
   - Keep mocks close to where they're used

10. **Assertions Style**

    - Use `.toEqual()` for object/array comparisons
    - Use `.toBe()` for primitive values
    - Use `.toBeInTheDocument()` for DOM assertions
    - Be specific about expected values when possible

    ```typescript
    expect(result.current.pokemonList).toEqual([]); // array
    expect(pokemon.height).toBe(6); // primitive
    expect(heading).toBeInTheDocument(); // DOM
    ```

11. **Flat Test Structure Without `describe()` Blocks**

    - Write all tests at the top level using only `it()` statements
    - **Never use `describe()` blocks** for grouping tests
    - When a test file grows too large, split it into multiple files with descriptive names
    - Use file names to communicate test grouping, not `describe()` blocks
    - For UI layer: apply outside-in user-centered behavior driven strategy from pages' views

    ✅ **GOOD - Flat structure with descriptive file name:**

    ```typescript
    // pokemon-list-sorting.test.ts
    it("sorts pokemon by height in ascending order when sort is enabled", () => {
      // test code
    });

    it("returns original order when sort is disabled", () => {
      // test code
    });

    it("handles empty list when sorting", () => {
      // test code
    });
    ```

    ❌ **BAD - Using describe() blocks:**

    ```typescript
    // pokemon-list.test.ts
    describe("sorting behavior", () => {
      // ❌ Don't use describe()
      it("sorts by height ascending", () => {});
      it("returns original order", () => {});
    });

    describe("error handling", () => {
      // ❌ Don't use describe()
      it("handles empty list", () => {});
    });
    ```

    **When to split files:**

    - Original file: `pokemon-list.test.ts` becomes too large (20+ tests)
    - Split into:
      - `pokemon-list-sorting.test.ts`
      - `pokemon-list-error-handling.test.ts`
      - `pokemon-list-loading-states.test.ts`

    **Benefits:**

    - File structure becomes the test organization system
    - Better IDE navigation (jump to specific test file)
    - Easier to find tests by file name search
    - Clearer test scope from file names
    - Simpler test runner output (no nested hierarchies)

12. **Mock Spy and Restoration**

    - Use `vi.spyOn()` for selective mocking
    - Always restore spies after test: `.mockRestore()`

    ```typescript
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    // ... test code ...
    consoleSpy.mockRestore();
    ```

13. **No Domain Constants in Tests**

    - **NEVER import domain constants** (url constants, config, etc.) in test files
    - Use **hardcoded strings** for expected values instead
    - Tests must be independent of implementation details
    - This prevents coupling tests to constants and catches regressions

    ❌ **BAD - Coupled to domain constants:**

    ```typescript
    import { url } from "../../../../lib/constants";

    expect(global.fetch).toHaveBeenCalledWith(
      `${url.BASE}${url.POKEMON}pikachu`
    );
    ```

    ✅ **GOOD - Explicit hardcoded values:**

    ```typescript
    expect(globalThis.fetch).toHaveBeenCalledWith(
      "https://pokeapi.co/api/v2/pokemon/pikachu"
    );
    ```

    **Applies to:**

    - Mock data files (`mocks.ts`)
    - Test files (`*.test.ts`, `*.test.tsx`)
    - Setup files (`setupTests.ts`)

    **Benefits:**

    - Tests are more readable (expected values are explicit)
    - Tests are independent from domain layer changes
    - Better regression detection (if URLs change, test assertions catch it)
    - No hidden dependencies on constants

14. **User-Oriented Helpers Pattern (userEvent Only)**

    **⚠️ CRITICAL RULE: Only `userEvent` actions can be helpers. Nothing else.**

    - Extract **ONLY user interactions** (`userEvent` methods) into named helper functions
    - Helpers encapsulate the complete user action (setup → find element → interact)
    - Apply to all user interactions, whether repeated or not (purpose is legibility, not DRY)
    - Name helpers from the user's perspective (what action, not implementation)
    - Store helpers in co-located `helpers.ts` file in `__tests__/` directory

    **Scope:**

    - ✅ Extract: `await user.click()`, `await user.type()`, `await user.hover()`, etc.
    - ❌ **NEVER extract**: DOM queries, `waitFor()`, `findByRole()`, `getByRole()`, `within()`, assertions
    - ✅ Combine element queries with userEvent actions inside the helper

    **What NOT to Extract (Keep in Tests):**

    ```typescript
    // ❌ DON'T extract DOM queries
    export const getTypeSection = () => screen.getByRole("main");

    // ❌ DON'T extract waitFor
    export const waitForList = () => waitFor(() => { ... });

    // ❌ DON'T extract assertions
    export const checkItemExists = (name) => expect(screen.getByText(name)).toBeInTheDocument();

    // ❌ DON'T extract element finding
    export const findButton = () => screen.findByRole("button");
    ```

    **Benefits:**

    - **Improved test legibility**: Tests read like user stories, not implementation details
    - Separates user actions from test setup and assertions
    - Easier to refactor UI interactions without changing test assertions
    - Clear separation of concerns: helpers = what user does, tests = setup + expectations

    ✅ **GOOD - User action helper:**

    ```typescript
    // helpers.ts
    export const clickButtonFireType = async () => {
      const user = userEvent.setup();
      const buttonFireType = await screen.findByRole("button", {
        name: /fire/i,
      });
      await user.click(buttonFireType);
    };

    // test.tsx
    it("renders fire type pokemons when user clicks fire button", async () => {
      render(<Home />);

      await clickButtonFireType();

      await waitFor(() => {
        expect(screen.getByText(/charmander/i)).toBeInTheDocument();
      });
    });
    ```

    ❌ **BAD - Test polluted with userEvent details:**

    ```typescript
    it("renders fire type pokemons when user clicks fire button", async () => {
      const user = userEvent.setup();
      render(<Home />);

      const buttonFireType = await screen.findByRole("button", {
        name: /fire/i,
      });
      await user.click(buttonFireType);

      await waitFor(() => {
        expect(screen.getByText(/charmander/i)).toBeInTheDocument();
      });
    });
    ```

    ❌ **BAD - Over-extracted (too granular):**

    ```typescript
    // Don't separate DOM queries from userEvent
    export const findFireButton = async () => {
      return await screen.findByRole("button", { name: /fire/i });
    };
    export const clickFireButton = async () => {
      const user = userEvent.setup();
      const button = await findFireButton();
      await user.click(button);
    };
    // Better to combine into one cohesive user action helper
    ```

## Important Technical Details

### Path Aliases

Configured in `vite.config.js`:

```typescript
$components → ./src/components
$lib → ./src/lib
```

### TypeScript Configuration

- Strict mode enabled
- `noUnusedLocals` and `noUnusedParameters` enforced
- `moduleResolution: "bundler"` for Vite compatibility

### Error Handling Chain

- HTTP errors → `FetchHttpClient` throws
- Repository propagates → Use case propagates
- Hook catches in try/catch → Sets error state
- UI displays error

### ID Generation Pattern

Domain defines `IdGenerator` interface, infrastructure provides `UuidGenerator`:

```typescript
// Domain
export interface IdGenerator {
  generate(): string;
}

// Infrastructure
export class UuidGenerator implements IdGenerator {
  generate(): string {
    return uuidv4();
  }
}
```

## Current Development Status

**Branch**: `refactor-list-to-hexagonal`
**Main Branch**: `front` (use for PRs)

Recent refactoring focused on:

- Extracting domain constants
- Injecting configuration for testability
- Implementing hexagonal architecture
- Improving separation of concerns

### Features Status

**Complete**:

- Pokemon type selection
- Virtualized Pokemon list with responsive grid
- Pokemon detail pages
- Height-based sorting
- Evolution chain navigation
- Type-based navigation

**In Development**:

- Pokemon filtering capabilities
- Pokemon comparison charts (2 Pokemon stats)
- Move-based analysis with type distribution

## Development Guidelines

### Shared UI Components Rule

**Elements in `src/ui` must be instantiated in at least 2 different features.**

- If a component is used in only one feature, extract it into that feature's folder instead
- This prevents premature abstraction and keeps components close to their usage
- Only promote to `src/ui` when genuine reuse across features is established

Example:

- ✅ `LoadingMessage` used in `pokemon-list` AND `select-pokemon-type` → stays in `src/ui`
- ❌ `SpecializedCard` only used in `pokemon-list` → move to `src/features/pokemon-list/`

### Adding New Features

1. **Start with Domain Layer**:

   - Define entities as simple data containers (classes with readonly properties)
   - Define ports (repository interfaces)
   - Add domain constants if needed
   - ⚠️ **Skip tests if entities have no behavior** (YAGNI - tests start at Repository layer)
   - ✅ **Write tests FIRST if entities need behavior** (methods with logic - use TDD)

2. **Create Use Cases**:

   - Implement business logic in `application/use-cases/`
   - Write tests mocking repository interfaces

3. **Implement Adapters**:

   - Create HTTP adapters in `adapters/http/`
   - Add DTOs and mappers
   - Test with mocked fetch

4. **Build React Integration**:

   - Create hooks in `application/hooks/`
   - Test with React Testing Library

5. **Add UI Components**:
   - Feature components connect to hooks
   - Presentational components remain pure

### Testing New Code

- Test each layer independently
- Mock external dependencies (APIs, browser APIs)
- Use co-located `__tests__/` directories
- Follow existing test patterns for consistency

## React Hook Architecture

### Hook Design: Separation of Concerns

Hooks should each have a **single, well-defined responsibility**. Do NOT combine unrelated concerns into one hook.

**✅ Correct: Separate hooks for separate concerns**

```typescript
// Hook 1: Data fetching and business logic
const { pokemonList, isLoading, isError, sortByHeight } =
  usePokemonList("grass");

// Hook 2: Performance optimization (virtualization)
const { visibleItems, totalHeight } = useVirtualGridList(pokemonList, {
  config: pokemonListConfig,
  breakpoints: responsiveBreakpoints,
});

// Component composes them
const sortedList = isSortedByHeight ? sortByHeight(pokemonList) : pokemonList;
const { visibleItems, totalHeight } = useVirtualGridList(sortedList, config);
```

**❌ Avoid: Combining unrelated concerns**

```typescript
// BAD: One hook doing 3+ things
const { visibleItems, totalHeight, pokemonList, sortByHeight, isLoading } =
  usePokemonListWithVirtualization("grass", config);
// ↑ Data fetching + sorting + virtualization = too many responsibilities
```

### Why Separation Matters

| Aspect              | Benefit                                                   |
| ------------------- | --------------------------------------------------------- |
| **Testability**     | Test each hook independently with different props         |
| **Reusability**     | Use `useVirtualGridList` with any array, not just Pokemon |
| **Maintainability** | Changes to one concern don't affect others                |
| **Clarity**         | Each hook's purpose is obvious from its name              |
| **Composability**   | Easy to add/remove concerns (sorting, filtering, etc.)    |

### Component Humility: Hook Orchestration

Components may orchestrate **multiple hooks** while remaining "humble" if they don't:

- Instantiate infrastructure (HTTP clients, repositories)
- Implement business logic (use hooks for that)
- Import application-layer classes directly

**✅ Humble component:**

```typescript
const { pokemonList, sortByHeight } = usePokemonList(type);
const sortedList = isSortedByHeight ? sortByHeight(pokemonList) : pokemonList;
const { visibleItems, totalHeight } = useVirtualGridList(sortedList, config);
// All infrastructure is hidden inside hooks, not in component
```

**❌ Not humble:**

```typescript
const repository = new HttpPokemonRepository(httpClient); // ❌ Infrastructure in component
const { pokemonList } = usePokemonList(type, repository);
const sorted = viewModel.sortPokemonList(pokemonList); // ❌ Business logic in component
```

## React Hook Architecture: Dependency Injection Pattern

### Hook Design: Overloads for Production and Testing

**CRITICAL PATTERN:** All hooks that create infrastructure (repositories, clients, services) MUST support dependency injection for testing while remaining simple for production use.

### Correct Pattern: Function Overloads

```typescript
// ✅ CORRECT: Overloaded hook with dependency injection

interface UseFeatureResult {
  data: DataType[];
  isLoading: boolean;
  isError: boolean;
}

// Overload 1: Production use (no parameters or simple flags)
function useFeature(): UseFeatureResult;
function useFeature(flag?: boolean): UseFeatureResult;

// Overload 2: Testing use (inject repository)
function useFeature(repository: FeatureRepository): UseFeatureResult;

// Implementation
function useFeature(
  secondParam?: boolean | FeatureRepository
): UseFeatureResult {
  const [data, setData] = useState<DataType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Determine if repository was injected
  const isRepositoryInjected =
    secondParam && typeof secondParam === "object" && "findAll" in secondParam; // Check repository interface method

  // Setup infrastructure (only if not injected)
  const httpClient = useMemo(() => new FetchHttpClient(url.BASE), []);

  const repository = useMemo(() => {
    if (isRepositoryInjected) {
      return secondParam as FeatureRepository;
    }
    return new HttpFeatureRepository(httpClient);
  }, [httpClient, isRepositoryInjected, secondParam]);

  const viewModel = useMemo(
    () => new FeatureViewModel(repository),
    [repository]
  );

  // Rest of hook logic...
  useEffect(() => {
    // Use viewModel to fetch data
  }, [viewModel]);

  return { data, isLoading, isError };
}

export default useFeature;
```

### Wrong Pattern: Force Injection from Component

```typescript
// ❌ WRONG: Component must create infrastructure

// Hook forces repository injection
export function useFeature(repository: FeatureRepository): UseFeatureResult {
  // ...
}

// Component must create infrastructure
const Component = () => {
  // ❌ Component creates infrastructure (violates separation)
  const repository = useMemo(() => new HttpFeatureRepository(url.BASE), []);

  const { data } = useFeature(repository);
  // ...
};
```

### Benefits of Overload Pattern

| Aspect          | With Overloads                                 | Without Overloads                          |
| --------------- | ---------------------------------------------- | ------------------------------------------ |
| **Production**  | Component calls `useFeature()` - simple        | Component must create repository - complex |
| **Testing**     | Test calls `useFeature(mockRepo)` - injectable | Cannot inject, must mock fetch globally    |
| **Separation**  | Infrastructure stays in hook                   | Infrastructure leaks to component          |
| **Reusability** | Hook self-contained                            | Component must know infrastructure details |

### When to Use This Pattern

✅ **USE overloads when:**

- Hook creates HTTP clients, repositories, or services
- Hook needs different behavior in production vs testing
- Hook orchestrates multiple infrastructure pieces

❌ **DON'T USE overloads when:**

- Hook only manages local state (useState, useReducer)
- Hook has no external dependencies
- Hook is pure UI logic (animations, refs, etc.)

### Examples in Project

**Correct implementations:**

- `src/features/pokemon-list/infrastructure/react/hooks/usePokemonList.ts` (lines 14-26)
- Pattern: Production accepts `selectedType` string, testing accepts `repository`

**Reference implementation to copy:**

```typescript
// Overload for component usage (no repository)
function usePokemonList(selectedType: string): UsePokemonListResult;

// Overload for testing (with repository injection)
function usePokemonList(
  selectedType: string,
  repository: PokemonRepository
): UsePokemonListResult;

// Implementation combines both
function usePokemonList(
  selectedType: string,
  secondParam?: PokemonRepository
): UsePokemonListResult {
  const isRepositoryInjected =
    secondParam &&
    typeof secondParam === "object" &&
    "findAllByType" in secondParam;

  const httpClient = useMemo(() => new FetchHttpClient(url.BASE), []);

  const repository = useMemo(() => {
    if (isRepositoryInjected) {
      return secondParam;
    }
    return new HttpPokemonRepository(httpClient, {
      typeEndpoint: url.TYPE,
      pokemonEndpoint: url.POKEMON,
    });
  }, [httpClient, isRepositoryInjected, secondParam]);

  // Use repository...
}
```

### Pre-Flight Checklist for New Hooks

Before implementing a new hook that uses infrastructure:

- [ ] Does this hook create repositories, clients, or services?
- [ ] Will I need to test this hook in isolation?
- [ ] Am I following the overload pattern from `usePokemonList`?
- [ ] Does the component call the hook WITHOUT creating infrastructure?
- [ ] Can I inject a mock repository in tests?

If you answered YES to questions 1-2 and NO to questions 3-5, you're implementing the wrong pattern.

### Quick Decision Tree

```
Does hook create infrastructure (repositories, clients)?
├─ NO → Simple hook, no overloads needed
└─ YES → Must use overload pattern
    ├─ Production: Hook creates infrastructure internally
    ├─ Testing: Inject mock repository
    └─ Component: Calls hook with no infrastructure params
```

### Modifying Virtual Scrolling

- Core logic in `VirtualGridCalculator` (framework-agnostic)
- Configuration in `domain/constants.ts`
- React integration in `useVirtualGridList` hook
- Test responsive behavior at different breakpoints
