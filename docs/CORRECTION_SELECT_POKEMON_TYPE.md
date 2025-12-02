# 🔧 Correction: Feature `select-pokemon-type`

## 📊 EXECUTIVE SUMMARY

### **Score: 8/10** 🟢

**Strengths:**

- ✅ Correct hexagonal architecture (layers well separated)
- ✅ Dependency Rule respected
- ✅ Shared Value Object (`PokemonType`) well placed
- ✅ Unit tests for Use Case and Repository well done
- ✅ Trivial Use Case but architecturally correct

**Weaknesses:**

- ❌ **Critical:** Hook `usePokemonTypes` does not follow overloads pattern for dependency injection
- ⚠️ Component creates infrastructure (consequence of previous point)
- ⚠️ Missing test for `useSelectPokemonType`
- ⚠️ Incomplete page tests (happy path only)

---

## 🎯 ACTION PLAN

Execute the following prompts **in sequential order**. Do not proceed to the next one until the previous one is completed and verified.

---

## ✅ STEP 1: Refactor Hook `usePokemonTypes` with Overloads

### **Objective:**

Implement the overloads pattern in `usePokemonTypes` to allow:

- **Production:** The hook creates its own repository internally
- **Testing:** Inject a mock repository from tests

### **Prompt for the agent:**

```
Refactor the usePokemonTypes hook in src/features/select-pokemon-type/infrastructure/react/hooks/usePokemonTypes.tsx to follow the same overloads pattern as usePokemonList.

REQUIREMENTS:

1. Create two function overloads:
   - Overload 1 (production): usePokemonTypes(): IUsePokemonTypesReturn
   - Overload 2 (testing): usePokemonTypes(repository: PokemonTypesRepository): IUsePokemonTypesReturn

2. In the implementation:
   - Use useMemo to create HttpPokemonTypesRepository only if repository is not injected
   - Import url from '../../lib/constants' for the baseUrl
   - The repository to use will be: repository || defaultRepository
   - Maintain all existing logic for useEffect, isMounted, loading and error

3. DO NOT change:
   - The IUsePokemonTypesReturn interface
   - The GetPokemonTypesUseCase logic
   - The types.map((type) => type.value) mapping
   - The useEffect cleanup with isMounted

4. Verify that existing tests in __tests__/usePokemonTypes.test.ts continue passing without modifications.

REFERENCE:
See src/features/pokemon-list/infrastructure/react/hooks/usePokemonList.ts lines 14-26 for the correct overloads pattern.
```

### **Verification:**

```bash
npm test src/features/select-pokemon-type/infrastructure/react/hooks/__tests__/usePokemonTypes.test.ts
```

**Expected result:** ✅ All tests pass without modifications

---

## ✅ STEP 2: Remove Repository Creation from Component

### **Objective:**

The `SelectPokemonType` component should not create infrastructure directly.

### **Prompt for the agent:**

```
Simplify the SelectPokemonType component in src/features/select-pokemon-type/SelectPokemonType.tsx by removing the repository creation.

REQUIRED CHANGES:

1. Remove these lines:
   - const repository = useMemo(() => new HttpPokemonTypesRepository(url.BASE), []);
   - The useMemo import
   - The HttpPokemonTypesRepository import
   - The url import

2. Change the hook call:
   BEFORE: const { typeNames, isLoading, isError } = usePokemonTypes(repository);
   AFTER: const { typeNames, isLoading, isError } = usePokemonTypes();

3. Keep intact:
   - useSelectPokemonType
   - handleButtonClick
   - All JSX return

EXPECTED RESULT:
The component should have these final imports:
- useCallback from 'react'
- SelectButton, SelectButtonList, LoadingMessage, ErrorMessage from '../../ui'
- DEFAULT_POKEMON_TYPE from './domain/constants'
- usePokemonTypes, useSelectPokemonType from './infrastructure/react/hooks'
```

### **Verification:**

```bash
npm test src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx
```

**Expected result:** ✅ Integration test continues to pass

---

## ✅ STEP 3: Add Tests for `useSelectPokemonType`

### **Objective:**

Test the `useSelectPokemonType` hook that handles URL params logic with React Router.

### **Prompt for the agent:**

```
Create tests for useSelectPokemonType in src/features/select-pokemon-type/infrastructure/react/hooks/__tests__/useSelectPokemonType.test.ts

FILE STRUCTURE:

import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import useSelectPokemonType from "../useSelectPokemonType";

REQUIRED TESTS:

1. it("returns selected type from URL params")
   - Wrapper: MemoryRouter with initialEntries={["/?type=fire"]}
   - Hook: useSelectPokemonType("normal")
   - Assert: selectedTypeParam toBe("fire")

2. it("sets default type when no type in URL")
   - Wrapper: MemoryRouter with initialEntries={["/"]}
   - Hook: useSelectPokemonType("normal")
   - Assert: selectedTypeParam toBe("normal") after waitFor

3. it("updates URL when selectType is called")
   - Wrapper: MemoryRouter with initialEntries={["/?type=normal"]}
   - Hook: useSelectPokemonType("normal")
   - Act: result.current.selectType("fire")
   - Assert: selectedTypeParam toBe("fire") after waitFor

WRAPPER PATTERN:
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={["/?type=fire"]}>
    {children}
  </MemoryRouter>
);

IMPORTANT:
- Use renderHook from @testing-library/react
- Use waitFor for async state changes
- Use act() for selectType calls
- DO NOT use describe() blocks, only it() statements
```

### **Verification:**

```bash
npm test src/features/select-pokemon-type/infrastructure/react/hooks/__tests__/useSelectPokemonType.test.ts
```

**Expected result:** ✅ 3 tests pass

---

## ✅ STEP 4: Complete Page Tests (Loading and Error)

### **Objective:**

Add tests for loading and error states to complete integration coverage.

### **Prompt for the agent:**

```
Add loading and error tests to the file src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx

TESTS TO ADD (at the end of the existing file):

1. it("shows loading message when fetching pokemon types")
   - Mock fetch with Promise that resolves after 100ms
   - Render: <MemoryRouter><Home /></MemoryRouter>
   - Assert: heading with /loading pokemon types/i is in the document
   - Assert: after waitFor (200ms), loading disappears

2. it("shows error message when fetch fails")
   - Mock fetch that returns { ok: false, status: 500 }
   - Render: <MemoryRouter><Home /></MemoryRouter>
   - Assert: after waitFor, heading with /error loading pokemon types/i is in the document

NECESSARY SETUP:
- beforeEach with vi.spyOn(console, 'error').mockImplementation(() => {})
- afterEach with vi.restoreAllMocks()

FETCH MOCK PATTERN FOR LOADING:
global.fetch = vi.fn(() =>
  new Promise(resolve =>
    setTimeout(() => resolve({
      ok: true,
      json: async () => ({ results: [] })
    }), 100)
  )
);

FETCH MOCK PATTERN FOR ERROR:
global.fetch = vi.fn(() => Promise.resolve({
  ok: false,
  status: 500
}));

IMPORTANT:
- DO NOT use describe() blocks
- Use waitFor with appropriate timeout for loading (200ms minimum)
- Suppress console.error in beforeEach for error tests
```

### **Verification:**

```bash
npm test src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx
```

**Expected result:** ✅ 3 tests pass (1 existing + 2 new)

---

## 🎉 FINAL VERIFICATION

### **Run Complete Test Suite:**

```bash
# Tests for the complete feature
npm test src/features/select-pokemon-type

# Integration tests on page
npm test src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx

# Verify we didn't break pokemon-list
npm test src/features/pokemon-list
```

### **Success Checklist:**

- [ ] ✅ `usePokemonTypes` has overloads (production + testing)
- [ ] ✅ `SelectPokemonType` does NOT create repository
- [ ] ✅ `useSelectPokemonType` has 3 tests
- [ ] ✅ Page has loading and error tests
- [ ] ✅ All `select-pokemon-type` tests pass
- [ ] ✅ `pokemon-list` tests continue to pass
- [ ] ✅ Integration tests in `Home` pass

---

## 📋 UPDATE CLAUDE.md

To avoid these errors in future implementations, add the following section to your `CLAUDE.md`:

---

## 🆕 NEW SECTION FOR CLAUDE.md

### **Location:** After `## React Hook Architecture`

````markdown
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
````

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

```

---

## 📝 FINAL NOTES

### **For your agent:**

1. **Always review existing similar hooks** before implementing a new one
2. **Dependency injection is critical** for testability
3. **Components do NOT create infrastructure** - that goes in hooks
4. **Tests should cover:** happy path, loading, error

### **For you (David):**

This overloads pattern is **fundamental** to maintain:
- ✅ "Humble" components (only orchestrate)
- ✅ Hooks testable in isolation
- ✅ Infrastructure hidden from component
- ✅ Flexibility to change implementation without touching UI

**Always reference:** `usePokemonList` is your "golden" hook - all other hooks with infrastructure should follow that exact pattern.

---

## 🎯 EXPECTED POST-CORRECTION RESULT

```

src/features/select-pokemon-type/
├── infrastructure/
│ └── react/
│ └── hooks/
│ ├── usePokemonTypes.tsx ← ✅ With overloads
│ └── **tests**/
│ ├── usePokemonTypes.test.ts ← ✅ Pass without changes
│ └── useSelectPokemonType.test.ts ← ✅ 3 new tests
│
├── SelectPokemonType.tsx ← ✅ Does NOT create repository
│
└── ...

src/pages/Home/**tests**/
└── Home.SelectPokemonType.test.tsx ← ✅ 3 tests (1 + 2 new)

```

**Test Count:**
- Select-pokemon-type feature: 8 tests (5 existing + 3 new)
- Home integration: 3 tests (1 existing + 2 new)
- **Total new:** 5 tests

---

**Author:** Ricardo (Claude Sonnet 4.5)
**Date:** 2025-11-07
**Context:** Audit of select-pokemon-type feature developed by agent
**Next feature:** Apply these learnings from the start
```
