[Español](/README.es.md) | [English](/README.en.md) | [Galego](/README.md)

# Pokemon Stats Dashboard

A **React-based Pokemon dashboard application** for exploring and analyzing Pokemon data with advanced performance optimizations and modern frontend patterns.

This project serves as a practical implementation of advanced React patterns, custom virtualization techniques, and comprehensive testing strategies using the **PokeAPI**.

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

#### ⚠️ **Features In Development:**

- Pokemon filtering capabilities
- Pokemon comparison charts (2 Pokemon stats comparison)
- Move-based analysis with type distribution charts

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

This personal project demonstrates advanced React patterns, performance optimization techniques, and clean architecture principles. The codebase implements **Hexagonal Architecture** for separation of concerns, with clear boundaries between domain, application, and infrastructure layers.

**Recent Refactoring Focus:**
- Implementation of Hexagonal/Clean Architecture patterns
- Extraction of domain constants for configuration injection
- Centralized mock organization for consistent testing
- Comprehensive test coverage across all layers
- Improved separation of concerns and testability

The application successfully balances technical complexity with user experience, creating a performant and accessible Pokemon exploration tool that demonstrates enterprise-grade architecture patterns in a practical context.

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
