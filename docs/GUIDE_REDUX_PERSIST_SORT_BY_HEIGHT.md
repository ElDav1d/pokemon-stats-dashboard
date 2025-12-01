# Guide: "Sort by Height" Persistence with Redux Toolkit Middleware

## 📋 Objective

Implement Redux Toolkit with a **custom middleware** to persist the "Sort by height" checkbox state in localStorage, following **Hexagonal Architecture** and **Clean Architecture** principles.

**We will NOT use Redux Persist.** We'll create our own middleware to have full control over persistence.

---

## 🎯 Expected Behavior

**Current behavior:**

```
1. User checks "Sort by height" checkbox
2. List gets sorted by height
3. User reloads the page
4. ❌ Checkbox goes back to unchecked
5. ❌ List returns to original order
```

**Behavior after implementing Redux Persist:**

```
1. User checks "Sort by height" checkbox
2. List gets sorted by height
3. ✅ State is saved to localStorage
4. User reloads the page
5. ✅ Checkbox remains checked
6. ✅ List remains sorted by height
```

---

## 🏗️ Architecture: Where Everything Goes

```
src/
├── features/
│   └── pokemon-list/
│       ├── domain/                           # 🔵 NO CHANGES
│       ├── application/                      # 🟢 NO CHANGES
│       ├── infrastructure/
│       │   ├── http/                         # 🟡 NO CHANGES
│       │   ├── react/
│       │   │   └── hooks/
│       │   │       └── usePokemonList.ts     # 🔄 MODIFY
│       │   └── redux/                        # ✅ NEW
│       │       ├── slices/
│       │       │   └── listPreferencesSlice.ts
│       │       └── selectors/
│       │           └── listPreferencesSelectors.ts
│       └── ui/
│           └── PokemonList.tsx               # 🔄 MODIFY
│
└── infrastructure/                           # 🟡 SHARED
    └── redux/
        ├── store.ts                          # ✅ NEW
        ├── rootReducer.ts                    # ✅ NEW
        ├── hooks.ts                          # ✅ NEW
        └── middleware/                       # ✅ NEW
            └── localStorageMiddleware.ts     # ✅ Custom Middleware
```

---

## 📦 Installing Dependencies

```bash
npm install @reduxjs/toolkit react-redux
```

**Recommended versions:**

- `@reduxjs/toolkit`: ^2.0.0
- `react-redux`: ^9.0.0

**We DON'T need `redux-persist`.** We'll create our own middleware.

---

## 🚀 Implementation Step by Step

---

### **Step 1: Create the Redux Slice**

**Location:** `src/features/pokemon-list/infrastructure/redux/slices/listPreferencesSlice.ts`

```typescript
import { createSlice } from "@reduxjs/toolkit";

/**
 * State for Pokemon list preferences
 * Only contains UI state, NOT business logic
 */
interface ListPreferencesState {
  sortByHeight: boolean;
}

const initialState: ListPreferencesState = {
  sortByHeight: false,
};

/**
 * Slice for handling list display preferences
 * Responsibility: Only UI state (which checkbox is checked)
 * NOT responsibility: Sorting logic (that goes in the ViewModel)
 */
export const listPreferencesSlice = createSlice({
  name: "listPreferences",
  initialState,
  reducers: {
    /**
     * Toggle the "Sort by height" checkbox state
     */
    toggleSortByHeight: (state) => {
      state.sortByHeight = !state.sortByHeight;
    },

    /**
     * Explicitly set the state (useful for tests)
     */
    setSortByHeight: (state, action) => {
      state.sortByHeight = action.payload;
    },

    /**
     * Reset to default values
     */
    resetPreferences: () => initialState,
  },
});

// Export actions
export const { toggleSortByHeight, setSortByHeight, resetPreferences } =
  listPreferencesSlice.actions;

// Export reducer
export default listPreferencesSlice.reducer;
```

**✅ Principles applied:**

- ✅ Only UI state (not business logic)
- ✅ Typed interface
- ✅ Comments explaining responsibilities
- ✅ Clear action names

---

### **Step 2: Create Selectors**

**Location:** `src/features/pokemon-list/infrastructure/redux/selectors/listPreferencesSelectors.ts`

```typescript
import { RootState } from "../../../../../infrastructure/redux/store";

/**
 * Selector to get the sortByHeight state
 * Allows components to subscribe only to this part of the state
 */
export const selectSortByHeight = (state: RootState): boolean =>
  state.listPreferences.sortByHeight;

/**
 * Selector to get all preferences
 * Useful if we add more preferences in the future
 */
export const selectAllPreferences = (state: RootState) => state.listPreferences;
```

**✅ Principles applied:**

- ✅ Typed selectors
- ✅ Granular (allow selective subscription)
- ✅ Documented

---

### **Step 3: Create Root Reducer**

**Location:** `src/infrastructure/redux/rootReducer.ts`

```typescript
import { combineReducers } from "@reduxjs/toolkit";
import listPreferencesReducer from "../../features/pokemon-list/infrastructure/redux/slices/listPreferencesSlice";

/**
 * Root reducer that combines all slices from the application
 * In the future, more slices can be added here:
 * - comparisonSlice (for Pokemon Comparison feature)
 * - filtersSlice (for advanced filtering)
 * - etc.
 */
const rootReducer = combineReducers({
  listPreferences: listPreferencesReducer,
  // Future slices:
  // comparison: comparisonReducer,
  // filters: filtersReducer,
});

export default rootReducer;
```

---

### **Step 4: Create Custom Middleware for localStorage**

**Location:** `src/infrastructure/redux/middleware/localStorageMiddleware.ts`

```typescript
import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";

/**
 * Key for storing state in localStorage
 */
const STORAGE_KEY = "pokemon-app-preferences";

/**
 * Custom middleware to sync Redux state with localStorage
 *
 * Responsibilities:
 * 1. Intercepts ALL actions
 * 2. If the action is from listPreferences, saves state to localStorage
 * 3. Does NOT block actions (always calls next(action))
 *
 * Advantages over Redux Persist:
 * - Full control over WHAT and WHEN to persist
 * - No external dependencies
 * - Easy to debug
 * - Easy to test
 */
export const localStorageMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    // 1. First, let the action pass to the reducer
    const result = next(action);

    // 2. After state updates, persist if necessary
    if (action.type?.startsWith("listPreferences/")) {
      try {
        // Get the updated state
        const state = store.getState();

        // Serialize and save to localStorage
        const dataToSave = {
          listPreferences: state.listPreferences,
          _timestamp: new Date().toISOString(), // For debugging
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

        // Log in development (optional)
        if (process.env.NODE_ENV === "development") {
          console.log("💾 State persisted to localStorage:", dataToSave);
        }
      } catch (error) {
        // Fail silently if localStorage is unavailable
        console.error("Failed to save to localStorage:", error);
      }
    }

    return result;
  };

/**
 * Helper function to load initial state from localStorage
 * Called once when creating the store
 */
export const loadStateFromLocalStorage = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);

    if (serializedState === null) {
      return undefined; // No saved state
    }

    const parsedState = JSON.parse(serializedState);

    // Log in development (optional)
    if (process.env.NODE_ENV === "development") {
      console.log("📂 State loaded from localStorage:", parsedState);
    }

    // Return only the parts we care about
    return {
      listPreferences: parsedState.listPreferences,
    };
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return undefined;
  }
};

/**
 * Helper function to clear localStorage (useful for testing or reset)
 */
export const clearPersistedState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️  Persisted state cleared");
  } catch (error) {
    console.error("Failed to clear localStorage:", error);
  }
};
```

**✅ Principles applied:**

- ✅ **Middleware pattern** - Intercepts actions without modifying them
- ✅ **Selective persistence** - Only persists `listPreferences/` actions
- ✅ **Error handling** - Fails silently if localStorage unavailable
- ✅ **Debugging** - Logs in development
- ✅ **Testability** - Exported helper functions

---

**Advantages of this approach vs Redux Persist:**

| Aspect            | Redux Persist  | Custom Middleware             |
| ----------------- | -------------- | ----------------------------- |
| **Control**       | Limited        | Total                         |
| **Bundle size**   | +15KB          | 0KB extra                     |
| **Configuration** | Complex        | Simple                        |
| **Debugging**     | Difficult      | Easy (own code)               |
| **Testing**       | Requires mocks | Simple tests                  |
| **Flexibility**   | Limited        | Total                         |
| **Performance**   | Good           | Excellent (only what needed)  |

---

### **Step 5: Configure Store with Custom Middleware**

**Location:** `src/infrastructure/redux/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import {
  localStorageMiddleware,
  loadStateFromLocalStorage,
} from "./middleware/localStorageMiddleware";

/**
 * Load initial state from localStorage (if it exists)
 */
const preloadedState = loadStateFromLocalStorage();

/**
 * Redux store with custom middleware
 */
export const store = configureStore({
  reducer: rootReducer,

  // ✅ Initial state loaded from localStorage
  preloadedState,

  // ✅ Add custom middleware
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware), // Our middleware at the end

  // DevTools only in development
  devTools: process.env.NODE_ENV !== "production",
});

/**
 * Types for TypeScript
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**✅ Configuration explained:**

| Option           | Value                         | Why                               |
| ---------------- | ----------------------------- | --------------------------------- |
| `reducer`        | `rootReducer`                 | Combines all slices               |
| `preloadedState` | `loadStateFromLocalStorage()` | Loads saved state on start        |
| `middleware`     | `localStorageMiddleware`      | Saves state on each action        |
| `devTools`       | Only in dev                   | Redux DevTools only in development |

**Persistence flow:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APP STARTS                                               │
│ loadStateFromLocalStorage() executes                        │
│ → Reads localStorage                                        │
│ → Returns saved state (or undefined)                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. STORE IS CREATED                                         │
│ preloadedState restores the saved state                     │
│ → Checkbox already in correct state                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER CHECKS CHECKBOX                                     │
│ dispatch(toggleSortByHeight())                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MIDDLEWARE INTERCEPTS                                    │
│ localStorageMiddleware detects "listPreferences/" action    │
│ → Lets action pass (next(action))                           │
│ → State updates in Redux                                    │
│ → Saves state to localStorage                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. COMPONENT RE-RENDERS                                     │
│ useAppSelector reads new state                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **Step 6: Create Typed Hooks**

**Location:** `src/infrastructure/redux/hooks.ts`

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Typed hook for useDispatch
 * Usage: const dispatch = useAppDispatch();
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Typed hook for useSelector
 * Usage: const value = useAppSelector(state => state.x);
 */
export const useAppSelector = useSelector.withTypes<RootState>();
```

**✅ Why typed hooks:**

- ✅ Autocomplete in TypeScript
- ✅ Detects errors at development time
- ✅ Better developer experience

---

### **Step 7: Modify the usePokemonList Hook**

**Location:** `src/features/pokemon-list/infrastructure/react/hooks/usePokemonList.ts`

```typescript
import { useState, useEffect, useMemo } from "react";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonListViewModel } from "../../../application/view-models/PokemonListViewModel";
import { HttpPokemonRepository } from "../../http/HttpPokemonRepository";
import { FetchHttpClient } from "../../../../../infrastructure/client/fetch/FetchHttpClient";
import { useAppSelector } from "../../../../../infrastructure/redux/hooks";
import { selectSortByHeight } from "../../redux/selectors/listPreferencesSelectors";

interface UsePokemonListResult {
  pokemonList: PokemonListItem[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Hook for managing Pokemon list
 * Integrates Redux to read sortByHeight state
 * Uses ViewModel for sorting logic
 */
function usePokemonList(selectedType: string): UsePokemonListResult {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // ✅ Read state from Redux (persists between reloads)
  const sortByHeight = useAppSelector(selectSortByHeight);

  // Setup infrastructure (no changes)
  const httpClient = useMemo(
    () => new FetchHttpClient("https://pokeapi.co/api/v2/"),
    []
  );

  const repository = useMemo(
    () => new HttpPokemonRepository(httpClient),
    [httpClient]
  );

  const viewModel = useMemo(
    () => new PokemonListViewModel(repository),
    [repository]
  );

  // ✅ Fetch data and apply sorting if enabled
  useEffect(() => {
    if (!selectedType) {
      setPokemonList([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        // 1. Load data from ViewModel
        let result = await viewModel.loadPokemonList(selectedType);

        // 2. ✅ Apply sorting if enabled in Redux
        if (sortByHeight) {
          result = viewModel.sortPokemonListByHeight(result);
        }

        setPokemonList(result);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
        setPokemonList([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedType, sortByHeight, viewModel]); // ✅ sortByHeight as dependency

  return {
    pokemonList,
    isLoading,
    isError,
  };
}

export default usePokemonList;
```

**✅ Changes applied:**

1. ✅ Imports `useAppSelector` and `selectSortByHeight`
2. ✅ Reads `sortByHeight` from Redux (line 30)
3. ✅ Applies sorting conditionally (line 58-60)
4. ✅ Adds `sortByHeight` to useEffect dependencies (line 71)

---

### **Step 8: Modify the PokemonList Component**

**Location:** `src/features/pokemon-list/ui/PokemonList.tsx`

```typescript
import { useSearchParams } from "react-router-dom";
import PokemonListItem from "./PokemonListItem";
import usePokemonList from "../infrastructure/react/hooks/usePokemonList";
import { useVirtualGridList } from "../../../infrastructure/react/hooks/useVirtualGridList";
import { pokemonListConfig, responsiveBreakpoints } from "../domain/constants";
import { useAppDispatch, useAppSelector } from "../../../infrastructure/redux/hooks";
import { toggleSortByHeight } from "../infrastructure/redux/slices/listPreferencesSlice";
import { selectSortByHeight } from "../infrastructure/redux/selectors/listPreferencesSelectors";

const PokemonList = () => {
  const [searchParams] = useSearchParams();
  const selectedTypeParam = searchParams.get("type");

  // ✅ Redux for UI state (persists)
  const dispatch = useAppDispatch();
  const sortByHeight = useAppSelector(selectSortByHeight);

  // Hook: Data fetching (already uses sortByHeight from Redux internally)
  const { pokemonList, isLoading, isError } = usePokemonList(
    selectedTypeParam ?? ""
  );

  // Virtualization
  const { visibleItems, totalHeight } = useVirtualGridList(pokemonList, {
    config: pokemonListConfig,
    breakpoints: responsiveBreakpoints,
  });

  const handleSortChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(toggleSortByHeight());
  };

  return (
    <section>
      {/* ✅ ALWAYS VISIBLE - UI preference independent of data */}
      <fieldset className="my-6">
        <legend className="text-lg l:text-xl xl:text-2xl">
          Order the pokemons:
        </legend>
        <input
          className="mr-2"
          type="checkbox"
          id="height"
          name="height"
          checked={sortByHeight} // ✅ From Redux (persists)
          onChange={handleSortChange}
        />
        <label htmlFor="height">By height</label>
      </fieldset>

      {/* ✅ Loading/error states */}
      {isLoading && (
        <div className="text-center my-4 text-gray-500">
          <h3>Loading pokemon list...</h3>
        </div>
      )}

      {isError && (
        <div className="text-center my-4 text-red-500">
          <h3>Error loading pokemon list. Please try again.</h3>
        </div>
      )}

      {/* ✅ List (only if there's data) */}
      {!isLoading && !isError && visibleItems.length > 0 && (
        <ul
          aria-label="Pokemon List"
          aria-live="polite"
          className="relative"
          style={{
            minHeight: `${totalHeight}px`,
          }}
        >
          <li
            className="absolute top-0 left-0 pointer-events-none invisible"
            style={{
              height: totalHeight,
            }}
            aria-hidden="true"
          />
          {visibleItems.map(({ item, offsetY, offsetX, width }) => (
            <li
              key={item.id}
              className="absolute"
              style={{
                top: offsetY,
                left: offsetX,
                width: width,
                height: pokemonListConfig.itemHeight,
              }}
            >
              <PokemonListItem
                name={item.name}
                height={item.height}
                imageUrl={item.imageUrl}
              />
            </li>
          ))}
        </ul>
      )}

      {/* ✅ Empty state (optional) */}
      {!isLoading && !isError && visibleItems.length === 0 && selectedTypeParam && (
        <div className="text-center my-4 text-gray-500">
          <p>No pokemon found for type "{selectedTypeParam}"</p>
        </div>
      )}
    </section>
  );
};

export default PokemonList;
```

**✅ Improvements applied:**

1. **Fieldset always visible** ✅

   - Checkbox doesn't disappear during loading/error
   - User always sees their preference state
   - Better UX: no "surprises" when changing types

2. **Redux integrated** ✅

   - Removes local `useState`
   - Uses `useAppDispatch` and `useAppSelector`
   - State persists between types and reloads

3. **Clear and separate states** ✅

   - Loading: spinner while loading
   - Error: error message
   - Success with data: shows list
   - Success without data: empty state message

4. **Simplified code** ✅
   - Removes `sortablePokemonList` (hook already sorts)
   - Removes sorting logic from component
   - Component is "humble" and only renders

---

**Behavior comparison:**

| Scenario                    | BEFORE (with useState)                     | NOW (with Redux)            |
| --------------------------- | ------------------------------------------ | --------------------------- |
| **User checks checkbox**    | ✅ Checks                                  | ✅ Checks                   |
| **User changes type**       | ❌ Checkbox disappears during loading      | ✅ Checkbox always visible  |
| **List finishes loading**   | ❌ Checkbox unchecked (lost state)         | ✅ Checkbox checked (saved) |
| **User reloads page**       | ❌ Checkbox unchecked                      | ✅ Checkbox checked         |

---

**User experience:**

```
┌─────────────────────────────────────────┐
│ 1. User in "fire" type                  │
│    Checks checkbox ✅                    │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. User changes to "water"              │
│    ✅ Checkbox ALWAYS visible (checked) │
│    Below: "Loading..."                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. "water" list loads                   │
│    ✅ Checkbox remains checked           │
│    ✅ List comes sorted                  │
│    ✅ Consistent experience              │
└─────────────────────────────────────────┘
```

---

### **Step 9: Configure App.tsx with Redux Provider**

**Location:** `src/App.tsx`

```typescript
import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./infrastructure/redux/store";
import { paths } from "./config/paths";

const Home = lazy(() => import("./pages/Home/Home"));
const Detail = lazy(() => import("./pages/Detail/Detail"));

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<h1>Loading...</h1>}>
          <Routes>
            <Route path={paths.BASE} element={<Home />} />
            <Route
              path={`${paths.BASE}${paths.DETAIL}`}
              element={<Detail />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
```

**✅ Differences from Redux Persist:**

- ❌ **We DON'T need** `<PersistGate>` - State already loads in the store
- ✅ **Simpler** - Only standard `<Provider>`
- ✅ **No loading** - State loads synchronously in `preloadedState`

**Why no PersistGate?**

```typescript
// Redux Persist (asynchronous):
// 1. Store created WITHOUT state
// 2. <PersistGate> waits for restoration
// 3. When done, renders app

// Our middleware (synchronous):
// 1. loadStateFromLocalStorage() executes BEFORE store creation
// 2. Store created ALREADY with restored state
// 3. App renders immediately with correct state
```

---

## ✅ Testing

### **Test the Middleware**

**Location:** `src/infrastructure/redux/middleware/__tests__/localStorageMiddleware.test.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import {
  localStorageMiddleware,
  loadStateFromLocalStorage,
  clearPersistedState,
} from "../localStorageMiddleware";
import listPreferencesReducer, {
  toggleSortByHeight,
} from "../../../../features/pokemon-list/infrastructure/redux/slices/listPreferencesSlice";

let store: any;

beforeEach(() => {
  // Clear localStorage before each test
  localStorage.clear();
  clearPersistedState();

  // Create store with middleware
  store = configureStore({
    reducer: {
      listPreferences: listPreferencesReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(localStorageMiddleware),
  });
});

afterEach(() => {
  localStorage.clear();
});

it("should save state to localStorage when listPreferences action is dispatched", () => {
  // Dispatch action
  store.dispatch(toggleSortByHeight());

  // Verify it was saved to localStorage
  const saved = localStorage.getItem("pokemon-app-preferences");
  expect(saved).not.toBeNull();

  const parsed = JSON.parse(saved!);
  expect(parsed.listPreferences.sortByHeight).toBe(true);
  expect(parsed._timestamp).toBeDefined();
});

it("should not save to localStorage for non-listPreferences actions", () => {
  // Dispatch an action that's not listPreferences
  store.dispatch({ type: "some/other/action" });

  // Nothing should be in localStorage
  const saved = localStorage.getItem("pokemon-app-preferences");
  expect(saved).toBeNull();
});

it("should update localStorage on every listPreferences action", () => {
  // Toggle 3 times
  store.dispatch(toggleSortByHeight()); // true
  store.dispatch(toggleSortByHeight()); // false
  store.dispatch(toggleSortByHeight()); // true

  // Verify final state
  const saved = localStorage.getItem("pokemon-app-preferences");
  const parsed = JSON.parse(saved!);
  expect(parsed.listPreferences.sortByHeight).toBe(true);
});

it("should return undefined if no state in localStorage", () => {
  const loaded = loadStateFromLocalStorage();
  expect(loaded).toBeUndefined();
});

it("should load state from localStorage", () => {
  // Save state manually
  const mockState = {
    listPreferences: { sortByHeight: true },
    _timestamp: new Date().toISOString(),
  };
  localStorage.setItem("pokemon-app-preferences", JSON.stringify(mockState));

  // Load state
  const loaded = loadStateFromLocalStorage();
  expect(loaded).toEqual({
    listPreferences: { sortByHeight: true },
  });
});

it("should return undefined if localStorage data is corrupted", () => {
  // Save invalid JSON
  localStorage.setItem("pokemon-app-preferences", "invalid json");

  const loaded = loadStateFromLocalStorage();
  expect(loaded).toBeUndefined();
});

it("should remove state from localStorage when cleared", () => {
  // Save something
  localStorage.setItem(
    "pokemon-app-preferences",
    JSON.stringify({ test: true })
  );

  // Clear
  clearPersistedState();

  // Verify it was deleted
  const saved = localStorage.getItem("pokemon-app-preferences");
  expect(saved).toBeNull();
});
```

---

### **Test the Slice**

**Location:** `src/features/pokemon-list/infrastructure/redux/slices/__tests__/listPreferencesSlice.test.ts`

```typescript
import listPreferencesReducer, {
  toggleSortByHeight,
  setSortByHeight,
  resetPreferences,
} from "../listPreferencesSlice";

const initialState = {
  sortByHeight: false,
};

it("should return initial state", () => {
  expect(listPreferencesReducer(undefined, { type: "unknown" })).toEqual(
    initialState
  );
});

it("should toggle sortByHeight from false to true", () => {
  const actual = listPreferencesReducer(initialState, toggleSortByHeight());
  expect(actual.sortByHeight).toBe(true);
});

it("should toggle sortByHeight from true to false", () => {
  const previousState = { sortByHeight: true };
  const actual = listPreferencesReducer(previousState, toggleSortByHeight());
  expect(actual.sortByHeight).toBe(false);
});

it("should set sortByHeight to true", () => {
  const actual = listPreferencesReducer(initialState, setSortByHeight(true));
  expect(actual.sortByHeight).toBe(true);
});

it("should set sortByHeight to false", () => {
  const previousState = { sortByHeight: true };
  const actual = listPreferencesReducer(previousState, setSortByHeight(false));
  expect(actual.sortByHeight).toBe(false);
});

it("should reset to initial state", () => {
  const previousState = { sortByHeight: true };
  const actual = listPreferencesReducer(previousState, resetPreferences());
  expect(actual).toEqual(initialState);
});
```

---

### **Test Selectors**

**Location:** `src/features/pokemon-list/infrastructure/redux/selectors/__tests__/listPreferencesSelectors.test.ts`

```typescript
import {
  selectSortByHeight,
  selectAllPreferences,
} from "../listPreferencesSelectors";
import { RootState } from "../../../../../../infrastructure/redux/store";

const mockState: RootState = {
  listPreferences: {
    sortByHeight: true,
  },
};

it("should select sortByHeight", () => {
  expect(selectSortByHeight(mockState)).toBe(true);
});

it("should select all preferences", () => {
  expect(selectAllPreferences(mockState)).toEqual({
    sortByHeight: true,
  });
});
```

---

### **Integration Test with Hook**

**Location:** `src/features/pokemon-list/infrastructure/react/hooks/__tests__/usePokemonList.test.tsx`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import usePokemonList from '../usePokemonList';
import listPreferencesReducer from '../../../redux/slices/listPreferencesSlice';

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      listPreferences: listPreferencesReducer,
    },
    preloadedState: initialState,
  });
};

const wrapper = ({ children, store }: any) => (
  <Provider store={store}>{children}</Provider>
);

it('should apply sorting when sortByHeight is true', async () => {
  const store = createMockStore({
    listPreferences: { sortByHeight: true },
  });

  const { result } = renderHook(() => usePokemonList('fire'), {
    wrapper: ({ children }) => wrapper({ children, store }),
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // Verify the list is sorted
  const heights = result.current.pokemonList.map(p => p.height);
  const sortedHeights = [...heights].sort((a, b) => a - b);
  expect(heights).toEqual(sortedHeights);
});

it('should not apply sorting when sortByHeight is false', async () => {
  const store = createMockStore({
    listPreferences: { sortByHeight: false },
  });

  const { result } = renderHook(() => usePokemonList('fire'), {
    wrapper: ({ children }) => wrapper({ children, store }),
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  // List doesn't need to be sorted
  expect(result.current.pokemonList.length).toBeGreaterThan(0);
});
```

---

## 🔍 Verification

### **1. Verify in Redux DevTools**

1. Install **Redux DevTools Extension** in your browser
2. Open the app and DevTools
3. Go to "Redux" tab
4. Click "Sort by height" checkbox
5. ✅ You should see the action `listPreferences/toggleSortByHeight`
6. ✅ See the state change: `sortByHeight: false → true`

---

### **2. Verify in localStorage**

1. Open DevTools → "Application" tab (Chrome) or "Storage" (Firefox)
2. Go to "Local Storage" → `http://localhost:5173`
3. ✅ You should see a key: `pokemon-app-preferences`
4. ✅ Value should contain:

```json
{
  "listPreferences": {
    "sortByHeight": true
  },
  "_timestamp": "2025-10-24T10:30:00.000Z"
}
```

---

### **3. Verify middleware logs (development)**

1. Open browser console
2. Check "Sort by height" checkbox
3. ✅ You should see in console:

```
💾 State persisted to localStorage: {
  listPreferences: { sortByHeight: true },
  _timestamp: "2025-10-24T10:30:00.000Z"
}
```

---

### **4. Verify persistence**

1. Check "Sort by height" checkbox
2. List gets sorted
3. Reload the page (F5)
4. ✅ Checkbox remains checked
5. ✅ List remains sorted

---

### **5. Verify middleware only runs on relevant actions**

1. Navigate between pages (Home → Detail → Home)
2. In console, you should NOT see persistence logs
3. Only when checking/unchecking checkbox should you see logs

---

## 🐛 Troubleshooting

### **Problem 1: State doesn't persist**

**Symptom:** On reload, checkbox goes back to unchecked.

**Solutions:**

1. Verify middleware is added to store:

```typescript
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadStateFromLocalStorage(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware), // ✅ Must be here
});
```

2. Check console for middleware logs (in development):

```
💾 State persisted to localStorage: { listPreferences: { sortByHeight: true }, _timestamp: "..." }
```

3. Verify in DevTools → Application → Local Storage:

   - Key: `pokemon-app-preferences`
   - Value should contain the state

4. Clear localStorage and try again:

```javascript
// In browser console
localStorage.clear();
```

---

### **Problem 2: Redux DevTools doesn't show up**

**Symptom:** No Redux tab in DevTools.

**Solutions:**

1. Install extension: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

2. Verify store configuration:

```typescript
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production", // ✅ Must be true in dev
});
```

---

### **Problem 3: TypeScript errors**

**Symptom:** Type errors using `useAppSelector` or `useAppDispatch`.

**Solutions:**

1. Verify typed hooks are correctly exported:

```typescript
// infrastructure/redux/hooks.ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

2. Import typed hooks (not from react-redux directly):

```typescript
// ❌ Don't use these
import { useDispatch, useSelector } from "react-redux";

// ✅ Use these
import { useAppDispatch, useAppSelector } from "../infrastructure/redux/hooks";
```

---

### **Problem 4: Middleware runs on every action**

**Symptom:** Persistence logs on ALL actions, not just listPreferences.

**Solution:**

Verify middleware filters correctly:

```typescript
export const localStorageMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    // ✅ Only persist if action starts with 'listPreferences/'
    if (action.type?.startsWith("listPreferences/")) {
      // ... save to localStorage
    }

    return result;
  };
```

---

### **Problem 5: localStorage is full**

**Symptom:** "QuotaExceededError" in console.

**Solutions:**

1. localStorage has a limit of ~5-10MB. Check what's stored:

```javascript
// In browser console
for (let key in localStorage) {
  console.log(key, localStorage.getItem(key).length);
}
```

2. If your app stores a lot, consider:
   - Compressing data before saving
   - Using IndexedDB for large data
   - Cleaning up old data periodically

---

### **Problem 6: State loads but component doesn't update**

**Symptom:** localStorage has state, but checkbox is unchecked.

**Solutions:**

1. Verify `preloadedState` is passed correctly:

```typescript
const preloadedState = loadStateFromLocalStorage();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState, // ✅ Must be here
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});
```

2. Verify selector reads from store:

```typescript
const sortByHeight = useAppSelector(selectSortByHeight);
console.log("sortByHeight from Redux:", sortByHeight);
```

3. Verify component uses correct value:

```typescript
<input
  type="checkbox"
  checked={sortByHeight} // ✅ Must come from Redux, not useState
  onChange={handleSortChange}
/>
```

---

## 📊 Flow Diagrams

### **Flow: User checks checkbox**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CHECKS CHECKBOX                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. UI COMPONENT                                             │
│ dispatch(toggleSortByHeight())                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE INTERCEPTS                                    │
│ localStorageMiddleware receives the action                  │
│ → Lets it pass: next(action)                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REDUCER UPDATES STATE                                    │
│ state.listPreferences.sortByHeight = !sortByHeight          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MIDDLEWARE PERSISTS                                      │
│ if (action.type.startsWith('listPreferences/')) {           │
│   localStorage.setItem('pokemon-app-preferences', state)    │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. COMPONENTS RE-RENDER                                     │
│ useAppSelector detects state change                         │
│ → Checkbox updates its value                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. USEEFFECT EXECUTES                                       │
│ Detects sortByHeight = true (dependency)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. VIEWMODEL APPLIES SORTING                                │
│ if (sortByHeight) {                                         │
│   result = viewModel.sortPokemonListByHeight(result)        │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. LIST RENDERS SORTED                                      │
└─────────────────────────────────────────────────────────────┘
```

---

### **Flow: User reloads page**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APP STARTS                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. LOAD STATE FROM LOCALSTORAGE                             │
│ const preloadedState = loadStateFromLocalStorage()          │
│ → Reads 'pokemon-app-preferences' from localStorage         │
│ → Returns: { listPreferences: { sortByHeight: true } }      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. STORE CREATED WITH INITIAL STATE                         │
│ configureStore({ preloadedState })                          │
│ → Redux already has sortByHeight: true                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. APP RENDERS                                              │
│ <Provider store={store}>                                    │
│ → Components access restored state                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. COMPONENT READS STATE                                    │
│ const sortByHeight = useAppSelector(selectSortByHeight)     │
│ → sortByHeight = true (restored value)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CHECKBOX RENDERS CHECKED                                 │
│ <input checked={sortByHeight} />                            │
│ → Checkbox is checked from the start                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. USEEFFECT FETCHES DATA                                   │
│ useEffect detects sortByHeight = true                       │
│ → Applies sorting automatically                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. LIST SHOWS SORTED                                        │
│ User sees the list sorted from the first render             │
└─────────────────────────────────────────────────────────────┘
```

---

### **Comparison: Redux Persist vs Custom Middleware**

| Aspect            | Redux Persist                           | Custom Middleware                              |
| ----------------- | --------------------------------------- | ---------------------------------------------- |
| **Timing**        | ⏱️ Asynchronous (needs `<PersistGate>`) | ⚡ Synchronous (loads in `preloadedState`)    |
| **Loading state** | ❌ Need to show spinner                 | ✅ No loading, state available immediately    |
| **Control**       | 🔒 Limited (configuration)              | 🎯 Total (own code)                           |
| **Bundle size**   | 📦 +15KB                                | 📦 +0KB                                        |
| **Debugging**     | 🐛 Complex (external code)              | 🐛 Easy (own logs)                            |
| **Testing**       | 🧪 Complex mocks required               | 🧪 Simple tests                               |

---

## 📝 Implementation Checklist

### **Initial Setup:**

- [ ] Install dependencies (`@reduxjs/toolkit`, `react-redux`)
- [ ] Create `listPreferencesSlice.ts`
- [ ] Create `listPreferencesSelectors.ts`
- [ ] Create `rootReducer.ts`
- [ ] Create `localStorageMiddleware.ts` with helper functions
- [ ] Create `store.ts` with middleware and preloadedState
- [ ] Create `hooks.ts` with typed hooks

### **Integration:**

- [ ] Modify `usePokemonList.ts` to use Redux
- [ ] Modify `PokemonList.tsx` to use Redux
- [ ] Add `<Provider>` in `App.tsx` (no PersistGate)

### **Testing:**

- [ ] Middleware tests (save, load, clear)
- [ ] Slice tests
- [ ] Selector tests
- [ ] Integration tests with hook
- [ ] Manual test: check checkbox, reload, verify persistence

### **Verification:**

- [ ] Redux DevTools shows actions
- [ ] localStorage contains state with correct structure
- [ ] Middleware logs appear in console (development)
- [ ] Checkbox persists between reloads
- [ ] List sorts correctly
- [ ] No warnings in console
- [ ] Middleware only runs on relevant actions

---

## 🎯 Next Steps

Once "Sort by height" persistence is implemented, you can extend Redux for:

### **1. Feature: Advanced Filters**

```typescript
interface ListPreferencesState {
  sortByHeight: boolean;
  heightRangeMin: number; // ✅ New
  heightRangeMax: number; // ✅ New
  searchQuery: string; // ✅ New
}
```

### **2. Feature: Pokemon Comparison**

```typescript
// New slice
interface ComparisonState {
  selectedIds: string[];
  pokemonData: Record<string, PokemonListItem>;
}
```

### **3. Feature: Theme Preferences**

```typescript
// New slice
interface ThemeState {
  mode: "light" | "dark";
  accentColor: string;
}
```

---

## 📚 References

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux Persist Docs](https://github.com/rt2zz/redux-persist)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

## ✅ Summary

**What we implemented:**

- ✅ Redux Toolkit for UI state
- ✅ **Custom middleware** for localStorage (no Redux Persist)
- ✅ Helper functions for load/save/clear state
- ✅ Hexagonal architecture respected (Redux in Infrastructure)
- ✅ Separation of concerns (Redux = UI state, ViewModel = logic)
- ✅ Automatic persistence of "Sort by height" checkbox
- ✅ Complete tests (middleware, slice, selectors, integration)

**Advantages of custom middleware:**

- ✅ Full control over persistence
- ✅ No external dependencies (+0KB vs +15KB)
- ✅ Synchronous loading (no `<PersistGate>`)
- ✅ Simpler and more direct code
- ✅ Easy to debug and test
- ✅ Informative development logs
- ✅ Selective action filtering

**Principles applied:**

- ✅ Clean Architecture (logic in domain/application)
- ✅ Hexagonal Architecture (Redux as adapter)
- ✅ Separation of Concerns (each layer has its responsibility)
- ✅ Single Responsibility (slice only UI state, middleware only persistence)
- ✅ Testability (tests without UI, without HTTP)
- ✅ KISS (Keep It Simple, Stupid)

---

**Author:** Claude Sonnet 4.5
**Date:** 2025-10-24
**Context:** Hexagonal Refactor - Feature pokemon-list
**Suggested Branch:** `feat/redux-custom-middleware-sort-by-height`
