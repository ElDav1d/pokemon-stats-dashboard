[Español](/README.es.md) | [English](/README.en.md) | [Galego](/README.md)

# 🎓 The Overengineered Pokemon Stats Dashboard

A **deliberately overengineered React-based Pokemon dashboard** designed as a **learning project** to study and understand **Clean Architecture** and **Hexagonal Architecture** patterns.

**Purpose:** This project intentionally applies enterprise-grade architectural patterns to a simple domain problem to explore advanced React patterns, custom virtualization techniques, comprehensive testing strategies, and clean code principles using the **PokeAPI**.

## 🎯 **Project Overview**

A comprehensive Pokemon data visualization tool that allows users to browse, filter, and analyze Pokemon information with a focus on performance, accessibility, and modern web development practices.

## 🏗️ **Technical Architecture**

### **Frontend Stack:**

- **React 18** with TypeScript
- **Vite** for build tooling
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Custom Virtual Scrolling** implementation
- **Vitest** for comprehensive testing

### **Hexagonal Architecture (Ports & Adapters)**

The application implements clean architecture principles with clear separation of concerns across layers:

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

**Key Architectural Patterns:**

- **Ports & Adapters** - Infrastructure depends on Domain (implements the interfaces); Domain defines interfaces; infrastructure provides implementations
- **Dependency Injection** - Configuration injected into hooks for testability
- **Value Objects** - Immutable domain concepts with self-validation
- **DTO Mapping** - HTTP responses mapped to domain entities in adapter layer
- **URL-Based State** - React Router's `useSearchParams` for type selection (no Redux/MobX)

### **Advanced Technical Implementations:**

#### **Custom Virtual Scrolling System:**

- **Browser-native scrolling** - Uses main browser scrollbar instead of container scrolling
- **Responsive grid virtualization** - Adapts to different screen sizes:
  - Mobile: 2 columns
  - Tablet: 3 columns
  - Desktop: 5 columns
- **Performance optimized** - Only renders visible items plus overscan buffer
- **Accessibility compliant** - Maintains semantic HTML structure (`<ul>` → `<li>`)

#### **Testing Strategy:**

- **TDD Approach with Layered Tests**

  - **Unit Tests (Foundation)** - Domain, Application, and Infrastructure layers
    - Pure logic testing without framework dependencies
    - Fast execution, 100% coverage target
  - **Integration Tests (Safeguard)** - Pages and component composition
    - Outside-in testing from user perspective
    - HTTP responses mocked, not external E2E tools

- **Mock Organization**

  - **Feature-level mocks** - Centralized in `__tests__/mocks.ts` at feature root
  - **Page-level mocks** - Scoped to `pages/{page}/__tests__/mocks.ts` for HTTP responses
  - **Consistent test data** - All tests within a feature use the same mock instances

- **Test Coverage**
  - Domain logic: entities, value objects, business rules
  - Application layer: use cases, view models, orchestration
  - Infrastructure: HTTP adapters, browser APIs, state management
  - UI: component composition and user interactions

## 🚀 **Key Features Implemented**

#### ✅ **Complete Features:**

- **Pokemon Type Selection** - Choose Pokemon by type
- **Virtualized Pokemon List** - High-performance scrolling for large datasets
- **Pokemon Detail Pages** - Individual Pokemon statistics and information
- **Height-based Sorting** - Order Pokemon by height
- **Evolution Chain Navigation** - Browse Pokemon evolution lines
- **Type-based Navigation** - Jump between Pokemon of the same type

## 📋 **Development Backlog**

### **Basic Features:**

- **Pokemon Type Listing**
  - ✅ As a Pokemon trainer, I want to choose a Pokemon type and see a list of Pokemon of that type
- **Pokemon Detail Page**
  - ✅ From the listing, I want to click on a Pokemon and see its image and stats

### **Intermediate Features:**

- **List Filtering & Sorting**
  - ⚠️ **Filtering:** Filter the Pokemon list by various criteria
  - ✅ **Sorting:** Sort the Pokemon list by height
- **Enhanced Pokemon Details**
  - ✅ **Evolution Navigation:** If a Pokemon has evolutions, access the evolution Pokemon's details
  - ✅ **Type Navigation:** Click on a Pokemon's type to see all Pokemon of that type

### **Advanced Features:**

- **Pokemon Comparison**
  - ⚠️ Select two Pokemon from the list and get a bar chart comparing 5 of their stats

### **Complex Features:**

- **Move-based Analysis**
  - ⚠️ Select two moves and get a bar chart comparing the number of Pokemon of each primary type that can learn them

## 🎨 **UI/UX Features**

- **Semantic HTML** - Proper accessibility structure
- **Loading states** - User feedback during API calls
- **Hover effects** - Interactive card animations
- **Responsive typography** - Scales appropriately across devices
- **Error handling** - Graceful degradation for API failures

## 📊 **Performance Characteristics**

- **Scalable rendering** - Handles hundreds of Pokemon without performance degradation
- **Memory efficient** - Only DOM nodes for visible items exist at any time
- **Smooth scrolling** - Maintains 60fps even with large datasets
- **Responsive design** - Adapts seamlessly across all device sizes

## 🔧 **Development Workflow**

- **TypeScript** for type safety and strict mode enforcement
- **ESLint/Prettier** for code quality and formatting
- **Vitest** for unit and integration testing with layered approach
- **Hot module replacement** for development efficiency
- **Hexagonal architecture** for maintainable, testable code organization
- **Dependency injection** for decoupled component design

## 📈 **Project Status**

### **Hexagonal Architecture Refactoring: 🚧 WORK IN PROGRESS (Learning Project)**

This is an **intentional overengineering exercise** to study and understand Clean and Hexagonal Architecture patterns. The codebase is undergoing a gradual refactoring to implement these patterns with clear separation of concerns across domain, application, and infrastructure layers.

**Note:** This is a pragmatic trade-off between learning architectural patterns and practical development. In production, many of these patterns would be considered over-architected for a simple Pokemon browsing application.

#### **✅ Fully Refactored to Hexagonal Architecture:**

- **`pokemon-list` Feature** - Complete hexagonal architecture:

  - ✅ Domain and application layers implemented
  - ✅ Repository pattern and HTTP adapters
  - ✅ DI pattern with function overloads for testing
  - ✅ Comprehensive testing across all layers

- **`select-pokemon-type` Feature** - Complete end-to-end implementation:

  - ✅ Domain layer: Entities and value objects
  - ✅ Application layer: Use cases for business logic
  - ✅ Infrastructure layer: HTTP adapters and React hooks
  - ✅ **Dependency Injection Pattern**: Function overloads for testable hooks
    - Production: `usePokemonTypes()` - infrastructure created internally
    - Testing: `usePokemonTypes(mockRepository)` - dependency injection for isolated testing
  - ✅ Components remain "humble" - zero infrastructure knowledge
  - ✅ Comprehensive testing: Unit tests per layer + integration tests
  - ✅ URL-specific fetch mocking for endpoint isolation
  - ✅ Complete UI state verification (loading → success/error)

- **`pokemon-detail` Feature** - Complete hexagonal architecture:
  - ✅ Domain layer: Entities (PokemonDetail, EvolutionChain) and value objects (PokemonStat, PokemonReference)
  - ✅ Application layer: Use cases (GetPokemonDetail, GetEvolutionChain, GetPokemonsByType) and view models
  - ✅ Infrastructure layer: HTTP adapters (HttpPokemonDetailRepository) and React hooks with DI
  - ✅ **Dependency Injection Pattern**: Function overloads for testable hooks
    - `usePokemonDetail(pokemonName)` - production use
    - `usePokemonDetail(pokemonName, mockRepository)` - testing with mocked repository
  - ✅ Components are "humble" - PokemonDetail, PokemonEvolutions, PokemonStats use only hooks
  - ✅ Evolution chain logic extracted to `EvolutionChain` entity with behavior and tests
  - ✅ Stats visualization extracted to `useStatsGraph` hook (D3 integration)
  - ✅ Type-based Pokemon fetching extracted to `usePokemonsByType` hook
  - ✅ Comprehensive testing: Unit tests per layer + integration tests
  - ✅ Complete UI state coverage (loading, error, success)

#### **⚠️ Partially Refactored:**

- NONE

#### **Definition of "Fully Refactored" (Our Criteria):**

1. Domain layer with entities and value objects
2. Application layer with use cases/view models
3. Infrastructure layer with HTTP adapters
4. React hooks with dependency injection (function overloads)
5. Components without direct infrastructure instantiation
6. Unit tests for each layer
7. Integration tests with endpoint-specific mocking
8. Complete UI state coverage (loading, error, success)
9. Documentation in CLAUDE.md about patterns used

**Status Summary**: Three features (`pokemon-list`, `select-pokemon-type`, `pokemon-detail`) are fully refactored to Hexagonal Architecture with comprehensive testing and dependency injection patterns.

This learning project demonstrates how Clean and Hexagonal Architecture principles can be applied to React applications, even when not strictly necessary for the business domain.

---

## 🚀 **Getting Started**

## Prerequisites:

You need to have Node.js and npm/yarn installed on your machine. To check if you have Node.js installed, run this command in your terminal:

```bash
node -v
```

```bash
yarn -v
```

## Clone the repository:

```
git clone <https://github.com/ElDav1d/pokemon-stats-dashboard>
```

## Install dependencies:

```
npm install or yarn
```

## Available Scripts

`npm run dev` or `yarn dev` to run in development mode
