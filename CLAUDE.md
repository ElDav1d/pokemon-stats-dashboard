# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based Pokemon dashboard application implementing advanced performance optimizations and hexagonal architecture patterns. The project uses the PokeAPI to provide Pokemon data visualization with a custom virtual scrolling system for large datasets.

**Tech Stack**: React 19 + TypeScript, Vite, React Router 7, Tailwind CSS 4, Vitest

**Package Manager**: npm 10.6.5 (required)

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
              ↓
┌─────────────────────────────────────┐
│   INFRASTRUCTURE (Adapters)         │  HTTP, virtualization, React hooks
└─────────────────────────────────────┘
```

### Key Architectural Patterns

**1. Ports and Adapters**

- Domain defines interfaces (ports) for external dependencies
- Infrastructure provides concrete implementations (adapters)
- Example: `PokemonRepository` (port) ← `HttpPokemonRepository` (adapter)

**2. Dependency Injection**

- Configuration injected into hooks for testability
- Example: `useVirtualGridList(items, { config, breakpoints })`

**3. Value Objects**

- Immutable domain concepts that prevent "primitive obsession"
- Examples: `PokemonType`, `PokemonByType`, `PokemonByName`
- Self-validating with encapsulated business rules

**4. Rich Domain Entities (Classes, not Interfaces)**

Entities are **classes** (not interfaces) to encapsulate behavior alongside data:

```typescript
// ✅ Entity encapsulates behavior
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

**Why classes instead of interfaces:**
- Centralizes domain logic (single source of truth for "what is large")
- Encapsulates validation and business rules
- Prevents duplication across UI components
- Testeable without rendering components
- Future behavior can be added without breaking contracts

**Domain-layer tests don't need React:**
```typescript
// Pure domain logic test, no framework needed
it("should classify large pokemon correctly", () => {
  const onix = new PokemonListItem("3", "onix", 88, "img.png");

  expect(onix.getSizeCategory()).toBe("large");
  expect(onix.isBossTier()).toBe(true);
});
```

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

### Test Organization

Tests are co-located with source code in `__tests__/` directories.

**Mock Scoping Rule**: Feature-level mocks must be consolidated in a single `__tests__/mocks.ts` file at the feature root. Page-level mocks are scoped to `pages/{page}/__tests__/mocks.ts` for UI-specific test data.

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

### Mock Usage Pattern

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

### Testing Strategy Overview

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

**TDD Workflow:**
1. Write unit test first (Red phase)
2. Implement minimal code to pass test (Green phase)
3. Refactor while tests remain green (Refactor phase)
4. Repeat for all layers
5. Integration tests from pages verify composition

### Testing Patterns by Layer

**Domain Layer** - Pure logic, no mocks needed:
- Test entities, value objects, and domain logic directly
- No framework imports required
- Tests run instantly
- Example: `expect(entity.getSizeCategory()).toBe("large")`

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

**Pages (UI Components)** - Integration tests from user perspective:
- Mock HTTP responses in `setupTests.ts`
- Test page composition of multiple hooks
- Verify user interactions trigger correct behavior
- Example: User selects type → list updates → items visible

### Test Configuration

Vitest uses `jsdom` environment with auto-discovered setup files:

- Automatically loads all `setupTests.ts` files via glob pattern
- Global test utilities available (`describe`, `it`, `expect`, `vi`)

### Mock Organization Best Practices

**Rule: Mocks are scoped at feature or page level, never scattered across individual test files.**

**Benefits:**

1. **Single Source of Truth**: All domain entity mocks for a feature in one place
2. **Consistency**: Tests use the same mock instances, preventing divergence
3. **Maintainability**: Update mock data in one location
4. **Discoverability**: New contributors know where to find/add mocks
5. **Reusability**: Easy to share mocks across multiple test files in the feature

**How to Organize Mocks:**

- **Feature-level:** `src/features/{feature}/__tests__/mocks.ts`
  - All domain entity mocks for the feature
  - Shared across use case, view model, and hook tests

- **Page-level:** `src/pages/{page}/__tests__/mocks.ts`
  - HTTP response mocks specific to the page
  - UI-specific test data

When adding new tests, always check if a mock already exists in the appropriate `__tests__/mocks.ts` before creating new ones. Keep mocks centralized in one place per layer to maintain consistency.

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

11. **Avoid Test Nesting**

    - Use top-level `it()` statements
    - Don't nest tests in `describe()` blocks, just break into scoped, self describingly named files when the initial one becomes too large
    - Keep test file structure flat and searchable
    - For UI layer: apply outside-in user-centered behavior driven strategy from pages' views

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

    - Extract **all user interactions** (`userEvent` methods) into named helper functions
    - Helpers encapsulate the complete user action (setup → find element → interact)
    - Apply to all user interactions, whether repeated or not (purpose is legibility, not DRY)
    - Name helpers from the user's perspective (what action, not implementation)
    - Store helpers in co-located `helpers.ts` file in `__tests__/` directory

    **Scope:**

    - ✅ Extract: `await user.click()`, `await user.type()`, `await user.hover()`, etc.
    - ❌ Don't extract: DOM queries, `waitFor()`, `findByRole()`, assertions
    - ✅ Combine element queries with userEvent actions inside the helper

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

### Adding New Features

1. **Start with Domain Layer**:

   - Define entities, value objects, and ports (interfaces)
   - Add domain constants if needed

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
const { pokemonList, isLoading, isError, sortByHeight } = usePokemonList("grass");

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

| Aspect | Benefit |
|--------|---------|
| **Testability** | Test each hook independently with different props |
| **Reusability** | Use `useVirtualGridList` with any array, not just Pokemon |
| **Maintainability** | Changes to one concern don't affect others |
| **Clarity** | Each hook's purpose is obvious from its name |
| **Composability** | Easy to add/remove concerns (sorting, filtering, etc.) |

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

### Modifying Virtual Scrolling

- Core logic in `VirtualGridCalculator` (framework-agnostic)
- Configuration in `domain/constants.ts`
- React integration in `useVirtualGridList` hook
- Test responsive behavior at different breakpoints
