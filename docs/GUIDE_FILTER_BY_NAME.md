# Filter by Name: Implementation Rationale

## Context & Problem

The Pokemon list displays all pokemon of a selected type. When a type has many pokemon (e.g., Normal has 100+), the user needs a way to quickly find a specific one by name. The filter is a text input that narrows the visible list client-side — no new API requests are made.

---

## Key Decisions

### 1. Local state, not Redux

`filterByName` lives as `useState("")` inside `useListControls`, not in the Redux `listControlsSlice`.

**Why:** `sortByHeight` is a *user preference* — the user explicitly chose a display mode and expects it to survive a page reload. It is persisted to `localStorage` via `createPersistenceMiddleware`. A name filter is *transient intent* — it belongs to a specific browsing moment. Restoring "char" on every reload would be surprising and unhelpful.

**Consequence:** `filterByName` resets to `""` naturally on every component unmount/remount (i.e., page reload or navigation away and back). No cleanup needed. No Redux action, no slice modification.

**Contrast:**

| State | Location | Persisted | Reason |
|-------|----------|-----------|--------|
| `sortByHeight` | Redux (`listControlsSlice`) | Yes (localStorage) | User preference |
| `filterByName` | Local `useState` (`useListControls`) | No | Transient — resets on reload |

---

### 2. Prerequisite refactor: `rawList` + `useMemo`

Before adding the filter, `usePokemonList` had `sortByHeight` inside its `useEffect`. This caused the entire pokemon list to be **re-fetched from the API** every time the user toggled the sort checkbox.

**Fix:** Separate fetch from transformation.

- `useEffect` only runs on `selectedType` change → one network request per type selection
- `useMemo` derives the displayed list from `rawList` (applies filter, then sort) → no network requests from UI interactions

This separation is what makes both sort and filter performant. Without it, every keystroke in the filter input would trigger an API call.

---

### 3. `usePokemonList` overload design

`filterByName` travels as a **direct parameter** to `usePokemonList`, not via Redux. This means `PokemonListSection` reads `filterByName` from `useListControls` and passes it down:

```typescript
const { filterByName, setFilterByName, ... } = useListControls();
const { pokemonList } = usePokemonList(selectedType, filterByName);
```

The hook already had a dependency injection overload for testing (`usePokemonList(type, mockRepository)`). Adding a filter string creates an ambiguity: what is the second argument — a filter or a repository?

**Solution:** Detect the type of the second argument at runtime.

Four supported calling conventions sharing a single implementation:

| Convention | Arguments | Used in |
|-----------|-----------|---------|
| `usePokemonList(type)` | 1 | Production, no filter |
| `usePokemonList(type, filterByName)` | 2 (string) | Production, with filter |
| `usePokemonList(type, repository)` | 2 (object) | Tests, no filter |
| `usePokemonList(type, repository, filterByName)` | 3 | Tests, with filter |

Detection logic:
```typescript
const isRepositoryInjected =
  secondParam !== undefined && typeof secondParam !== "string";

const filterByName =
  typeof secondParam === "string" ? secondParam : (thirdParam ?? "");
```

**Critical detail:** The `repositoryInstance` `useMemo` must depend on `injectedRepository` (the extracted object-or-undefined), NOT on `secondParam` directly. If it depended on `secondParam`, every keystroke (changing `filterByName` = `secondParam`) would recreate the repository and the ViewModel, which would fire `useEffect` and trigger a new API fetch.

```typescript
// ✅ Correct — stable reference, not affected by filter string changes
const injectedRepository = isRepositoryInjected
  ? (secondParam as PokemonRepository)
  : undefined;

const repositoryInstance = useMemo(() => {
  if (injectedRepository !== undefined) return injectedRepository;
  return new HttpPokemonRepository(httpClient, {...});
}, [httpClient, injectedRepository]); // ← no secondParam here
```

---

### 4. Debounce inside `usePokemonList`

Without debounce, the list recalculates on every keystroke. Typing "charmeleon" (10 characters) would trigger 10 `useMemo` executions, causing 10 rapid list re-renders. The visual effect is a list that flickers on every key.

**Solution:** `useDebounce(filterByName, 300)` inside `usePokemonList`. The `useMemo` for `pokemonList` uses `debouncedFilter`, not `filterByName` directly. The list only updates 300ms after the user stops typing.

**Why inside the hook, not in the component:** Debounce is an implementation detail of how the filter is applied internally. Components should not need to know that a filter requires debouncing. `PokemonListSection` just passes `filterByName` and receives `pokemonList`.

**Why 300ms:** Industry convention for search inputs. Fast enough to feel responsive, slow enough to avoid flickering.

---

### 5. Transformation order: filter → sort

Inside `usePokemonList`'s `useMemo`:

```typescript
let list = debouncedFilter
  ? viewModel.filterPokemonsByName(rawList, debouncedFilter)
  : rawList;
if (sortByHeight) list = viewModel.sortPokemonListByHeight(list);
return list;
```

**Why filter first:** Sort is stable within the filtered set. Filtering first reduces the set before sorting, which is slightly more efficient. More importantly, it's semantically correct: the user filters to a subset, then optionally orders that subset.

**Example:** If raw list is [charizard(17), charmander(6), charmeleon(11)] and filter is "char" and sort is by height:
1. Filter: [charizard(17), charmander(6), charmeleon(11)] — all 3 match
2. Sort: [charmander(6), charmeleon(11), charizard(17)]

If we sorted first, the intermediate [charmander(6), charmeleon(11), charizard(17)] set would then be filtered, producing the same result. But the filter-first order is the natural mental model: "show me 'char' pokemon, sorted by height."

---

### 6. `useDebounce` in shared infrastructure

The `useDebounce<T>(value: T, delay: number): T` hook lives in `src/shared/infrastructure/react/hooks/useDebounce.ts`.

**Why shared:** Debounce is a generic timing utility with no domain knowledge. It works with any type T, any delay, any use case. Keeping it in the feature would be premature specificity. Keeping it in shared makes it available to any future feature that needs debounced state.

**Contract:** Input: any value + delay in ms. Output: debounced version of the value. The debounced value initializes to the same value (no initial delay). Changes propagate after `delay` ms of inactivity.

---

## Data Flow Diagram

```
User types "char" in <input>
        │
        ▼
onChange → setFilterByName("char")   [useState in useListControls]
        │
        ▼
PokemonListSection re-renders
        │
        ▼
usePokemonList("fire", "char")
        │
        ├─► useDebounce("char", 300)
        │         │
        │         └─ after 300ms → debouncedFilter = "char"
        │
        ├─► useEffect [NO re-run — selectedType unchanged]
        │         rawList = [charmander, charmeleon, charizard]  (unchanged)
        │
        └─► useMemo [re-runs when debouncedFilter changes]
                  list = filterPokemonsByName(rawList, "char")
                       = [charmander, charmeleon, charizard]  (all match "char")
                  if sortByHeight → sortPokemonListByHeight(list)
                  return list
        │
        ▼
pokemonList = [charmander, charmeleon, charizard]
        │
        ▼
useVirtualGridList(pokemonList, config)
        │
        ▼
PokemonListGrid renders visible items
```

---

## Files Changed & Why

| File | Change | Why |
|------|--------|-----|
| `application/use-cases/filter-pokemons-by-name/FilterPokemonsByNameUseCase.ts` | Created | Pure domain use case — case-insensitive substring filter |
| `application/use-cases/filter-pokemons-by-name/__tests__/FilterPokemonsByNameUseCase.test.ts` | Created | TDD unit tests for the use case |
| `application/view-models/PokemonListViewModel.ts` | Added `filterPokemonsByName()` | ViewModel delegates to use case, following the sort pattern |
| `application/view-models/__tests__/PokemonListViewModel.test.ts` | Extended | Verify ViewModel delegates correctly |
| `shared/infrastructure/react/hooks/useDebounce.ts` | Created | Generic debounce hook used by `usePokemonList` |
| `infrastructure/react/hooks/useListControls.ts` | Added `filterByName` + `setFilterByName` | Local state (not Redux) for transient filter value |
| `infrastructure/react/hooks/__tests__/useListControls.test.ts` | Extended | Verify initial value and setter |
| `infrastructure/react/hooks/usePokemonList.ts` | Added overloads, `useDebounce`, filter in `useMemo` | Core hook update — see decision 3 |
| `infrastructure/react/hooks/__tests__/usePokemonList.filterByName.test.ts` | Created | TDD hook tests for filter behavior |
| `PokemonListControls.tsx` | Added search input + `filterByName` props | UI: renders the `<input type="text">` with proper label |
| `PokemonListSection.tsx` | Passes `filterByName` to hook and controls | Wires state from `useListControls` through the hook and into the UI |
| `pages/Home/__tests__/helpers.ts` | Added `typeInNameFilter()` | User action helper following the project helper pattern |
| `pages/Home/__tests__/Home.FilterByName.test.tsx` | Created | Integration test written first (TDD outside-in) |
