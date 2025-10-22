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

### Directory Organization

**Features** (`src/features/`) - Feature modules with hexagonal structure:

- `pokemon-list/` - Main list feature
  - `domain/` - Business logic layer
    - `ports/` - Interfaces (e.g., `PokemonRepository`)
    - `entities/` - Domain models (e.g., `PokemonListItem`)
    - `value-objects/` - Immutable objects (e.g., `PokemonType`)
    - `constants.ts` - Domain configuration (grid config, breakpoints)
  - `application/` - Use cases and hooks
    - `use-cases/` - Business operations (`GetPokemonListUseCase`)
    - `hooks/` - React integration (`usePokemonList`)
  - `adapters/` - Infrastructure implementations
    - `http/` - HTTP adapter (`HttpPokemonRepository`)
      - `dto/` - Data Transfer Objects
      - `mappers.ts` - DTO to domain transformations
  - Component files (`PokemonList.tsx`, `PokemonListItem.tsx`)

**Infrastructure** (`src/infrastructure/`) - Cross-cutting concerns:

- `client/` - HTTP client abstraction
  - `http/` - `HttpClient` interface (port)
  - `fetch/` - `FetchHttpClient` implementation (adapter)
- `react/hooks/` - React-specific utilities (`useVirtualGridList`)
- `virtualization/` - Framework-agnostic virtual scrolling logic

**Shared** (`src/lib/`) - Utilities and constants
**Components** (`src/components/`) - Reusable presentational components
**Pages** (`src/pages/`) - Route-level page components

### Key Architectural Patterns

**1. Ports and Adapters**

- Domain defines interfaces (ports) for external dependencies
- Infrastructure provides concrete implementations (adapters)
- Example: `PokemonRepository` (port) ← `HttpPokemonRepository` (adapter)

**2. Dependency Injection**

- Configuration injected into hooks for testability
- Example: `useVirtualGridList(items, { config, breakpoints })`

**3. Value Objects**

- Immutable domain concepts (e.g., `PokemonType`)
- Self-validating, encapsulate business rules

**4. DTO Mapping**

- HTTP responses mapped to domain entities in adapter layer
- Mappers in `adapters/http/mappers.ts`

**5. URL-Based State**

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

Tests are co-located with source code in `__tests__/` directories:

```
feature/
├── application/
│   ├── use-cases/
│   │   └── use-case-name/
│   │       ├── UseCase.ts
│   │       └── __tests__/
│   │           ├── UseCase.test.ts
│   │           └── mocks.ts
│   └── hooks/
│       └── __tests__/
│           └── hook.test.ts
```

### Testing Patterns by Layer

**Domain Layer** - Pure logic, no mocks needed:

```typescript
const calculator = new VirtualGridCalculator(mockItems, config);
expect(calculator.calculateTotalHeight()).toBe(1190);
```

**Application Layer (Use Cases)** - Mock repository interfaces:

```typescript
const repoMock: PokemonRepository = {
  findAllByType: vi.fn().mockResolvedValue(fakePokemons),
  findDetailsByName: vi.fn().mockResolvedValue(details[0]),
};
```

**Application Layer (Hooks)** - React Testing Library:

```typescript
const { result } = renderHook(() => usePokemonList("grass", mockRepository));
await waitFor(() => {
  expect(result.current.pokemonList.length).toBe(3);
});
```

**Infrastructure Layer** - Mock browser APIs:

```typescript
Object.defineProperty(window, "scrollY", { writable: true, value: 400 });
window.dispatchEvent(new Event("scroll"));
```

**HTTP Adapters** - Mock fetch responses:

```typescript
global.fetch = vi.fn().mockResolvedValue({
  json: async () => pokemonByTypeResponseMock,
  ok: true,
});
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
