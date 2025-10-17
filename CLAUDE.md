# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React-based Pokemon dashboard application implementing advanced performance optimizations and hexagonal architecture patterns. The project uses the PokeAPI to provide Pokemon data visualization with a custom virtual scrolling system for large datasets.

**Tech Stack**: React 19 + TypeScript, Vite, React Router 7, Tailwind CSS 4, Vitest

**Package Manager**: pnpm 10.6.5 (required)

## Common Commands

### Development
```bash
pnpm dev          # Start development server on port 3000
pnpm build        # TypeScript compile + Vite build
pnpm preview      # Preview production build
```

### Testing
```bash
pnpm test         # Run tests in watch mode
vitest run        # Run tests once without watch
vitest --ui       # Open Vitest UI
```

### Code Quality
```bash
pnpm lint         # Run ESLint (TypeScript files)
pnpm format       # Format code with Prettier
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
  gap: 16,           // Pixels between items
  itemHeight: 200,   // Item height in pixels
  overscan: 5        // Extra items rendered outside viewport
};

export const responsiveBreakpoints = {
  desktopMinWidth: 768,    // ≥768px = 5 columns
  tabletMinWidth: 640,     // ≥640px = 3 columns
  mobileColumns: 2         // <640px = 2 columns
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
  findDetailsByName: vi.fn().mockResolvedValue(details[0])
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
  ok: true
});
```

### Test Configuration

Vitest uses `jsdom` environment with auto-discovered setup files:
- Automatically loads all `setupTests.ts` files via glob pattern
- Global test utilities available (`describe`, `it`, `expect`, `vi`)

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
  generate(): string { return uuidv4(); }
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

### Modifying Virtual Scrolling

- Core logic in `VirtualGridCalculator` (framework-agnostic)
- Configuration in `domain/constants.ts`
- React integration in `useVirtualGridList` hook
- Test responsive behavior at different breakpoints
