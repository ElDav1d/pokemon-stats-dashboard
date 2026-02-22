# Filter by Height Range: Implementation Rationale

## Context & Problem

The Pokemon list displays all pokemon of a selected type. The name filter already narrows the list by text. Height adds a second dimension: users may want to find pokemon within a specific size window — "only the small ones", "mid-tier fighters", "tall enough to stand out". Height (`PokemonListItem.height`) is already available from the API, so no new network calls or entity changes are needed.

Two inputs (min + max) — the user defines the range, the app does not impose one.

---

## Key Decisions

### 1. Local state, not Redux

`filterByMinHeight` and `filterByMaxHeight` live as `useState(0)` inside `useListControls`, not in the Redux `listControlsSlice`.

**Why:** Same reasoning as `filterByName`. `sortByHeight` is a *user preference* — the user chose a display mode and expects it to survive a page reload. It is persisted to `localStorage` via `createPersistenceMiddleware`. A height range filter is *transient intent* — it belongs to a specific browsing moment. Restoring "min: 10, max: 50" on every reload would be surprising and unhelpful.

**Consequence:** Both values reset to `0` naturally on every component unmount/remount. No cleanup needed. No Redux actions, no slice modification.

**Contrast:**

| State | Location | Persisted | Reason |
|-------|----------|-----------|--------|
| `sortByHeight` | Redux (`listControlsSlice`) | Yes (localStorage) | User preference |
| `filterByName` | Local `useState` (`useListControls`) | No | Transient — resets on reload |
| `filterByMinHeight` | Local `useState` (`useListControls`) | No | Transient — resets on reload |
| `filterByMaxHeight` | Local `useState` (`useListControls`) | No | Transient — resets on reload |

---

### 2. `ListFilters` object instead of positional params

**The problem:** After adding `filterByName`, `usePokemonList` had 4 calling conventions detected by checking `typeof secondParam`:

| Convention | Arguments |
|-----------|-----------|
| `usePokemonList(type)` | 1 |
| `usePokemonList(type, filterByName)` | 2 (string) |
| `usePokemonList(type, repository)` | 2 (object) |
| `usePokemonList(type, repository, filterByName)` | 3 (string) |

Adding `filterByMinHeight` and `filterByMaxHeight` as extra positional params would create 8+ combinations (with/without each filter, with/without repository). Detection via `typeof` would become unmaintainable.

**Solution:** Group all filter values into a `ListFilters` object exported from the hook:

```typescript
export interface ListFilters {
  filterByName?: string;
  filterByMinHeight?: number;
  filterByMaxHeight?: number;
}

// 2 overloads:
function usePokemonList(selectedType: string, filters?: ListFilters): UsePokemonListResult;
function usePokemonList(selectedType: string, repository: PokemonRepository, filters?: ListFilters): UsePokemonListResult;
```

**Detection logic change:** From `typeof secondParam !== "string"` to duck-typing on the repository interface:

```typescript
const isRepositoryInjected =
  secondParam !== undefined && "findAllByType" in secondParam;
```

This is more explicit and more robust — it checks for the method that defines `PokemonRepository`, not the absence of string type.

**Result:** Clean 2-overload design. Adding new filter fields in the future only requires adding a field to `ListFilters` — no overload changes.

**Zero as sentinel:** `0` means "no bound applied". Inputs display empty when value is `0` (`value={minValue || ""}`). The use case treats `0` as "no constraint on this side".

---

### 3. No debounce for height inputs

`filterByName` is debounced 300ms inside `usePokemonList` because text inputs fire a change event on every keystroke. Typing "charizard" produces 9 rapid filter recalculations.

Number inputs (`type="number"`) behave differently:
- They fire on blur (user leaves the field)
- They fire on arrow-key increments (deliberate, one step at a time)
- They do NOT fire on every digit typed until the field loses focus

Adding `useDebounce` to `filterByMinHeight` and `filterByMaxHeight` would introduce perceptible lag (e.g., after clicking a spinner arrow, the list wouldn't update for 300ms) with no UX benefit.

**Implementation:** `filterByMinHeight` and `filterByMaxHeight` are used directly in `useMemo` without `useDebounce`.

```typescript
// Inside usePokemonList's useMemo:
if (filterByMinHeight > 0 || filterByMaxHeight > 0) {
  list = viewModel.filterPokemonsByHeightRange(list, filterByMinHeight, filterByMaxHeight);
}
```

---

### 4. `isInvalidHeightRange` as derived state, not `useState`

An invalid range is when both bounds are set and min > max (e.g., min: 15, max: 5 — no pokemon can have height ≥ 15 AND ≤ 5 simultaneously).

**Why not `useState`:** `isInvalidHeightRange` is always a pure function of `filterByMinHeight` and `filterByMaxHeight`. Computing it as derived state:

```typescript
const isInvalidHeightRange =
  filterByMinHeight > 0 && filterByMaxHeight > 0 && filterByMinHeight > filterByMaxHeight;
```

Using `useState(false)` and syncing it with a `useEffect` would introduce a render cycle delay — the validation would be one render behind the actual values. Derived computation is always in sync, has no extra renders, and cannot drift.

---

### 5. Use case returns `[]` for invalid range

`FilterPokemonsByHeightRangeUseCase.execute(list, minHeight, maxHeight)` returns an empty array when both `minHeight > 0` and `maxHeight > 0` and `minHeight > maxHeight`.

**Why in the use case, not just the UI:** The use case enforces correctness at the application layer. Even if the UI validation is somehow bypassed (direct state manipulation, a test injecting values, future UI changes), the result is consistent and predictable — an impossible range always produces an empty list.

This separates two concerns:
- **Use case:** "What is the correct result for this input?" (returns `[]`)
- **UI:** "How do I communicate the error to the user?" (shows `role="alert"` message)

Both fire simultaneously — the list goes empty AND the validation message appears. Neither depends on the other.

---

### 6. `role="alert"` vs `role="status"` for validation message

Two ARIA live region roles are relevant here:

- `role="status"` → `aria-live="polite"` — screen reader announces after finishing current speech
- `role="alert"` → `aria-live="assertive"` — screen reader interrupts immediately

**Why `role="alert"`:** A validation error (min > max creates an impossible range) is actionable and urgent. The user has just entered a contradictory state — the filter will return nothing and they may not understand why. Immediate interruption is the right signal: "stop, something is wrong with your input."

**Contrast with empty state:** The "no Pokémon found" message uses `<output>`, which has an implicit `aria-live="polite"`. That message is informational — "your filter is valid but nothing matches it." It waits for a natural pause. A validation error does not wait.

---

### 7. Transformation order: name filter → height filter → sort

Inside `usePokemonList`'s `useMemo`:

```typescript
let list = rawList;

if (debouncedFilterByName) {
  list = viewModel.filterPokemonsByName(list, debouncedFilterByName);
}

if (filterByMinHeight > 0 || filterByMaxHeight > 0) {
  list = viewModel.filterPokemonsByHeightRange(list, filterByMinHeight, filterByMaxHeight);
}

if (sortByHeight) {
  list = viewModel.sortPokemonListByHeight(list);
}

return list;
```

**Why name first:** The name filter is the primary text search. Applying it first reduces the set before the height filter operates on it, which is slightly more efficient. The order also matches the UI layout left-to-right: search input → height range → sort.

**Why sort last:** Sort is always applied to the final filtered set. Sorting before filtering would produce correct results, but would discard the sorted order during filtering, requiring another sort pass anyway.

**Example:** Raw list is [bulbasaur(h:20), ivysaur(h:10), venusaur(h:7)], filter name "saur" (all match), min height 8:
1. Name filter: [bulbasaur(20), ivysaur(10), venusaur(7)] — all contain "saur"
2. Height filter (min: 8): [bulbasaur(20), ivysaur(10)] — venusaur(7) excluded
3. Sort (if enabled): [ivysaur(10), bulbasaur(20)]

---

## Data Flow Diagram

```
User types "10" in Min Height <input>
        │
        ▼
onChange → setFilterByMinHeight(10)   [useState in useListControls]
        │
        ▼
PokemonListSection re-renders
        │
        ├─► isInvalidHeightRange = (10 > 0 && 0 > 0 && 10 > 0) = false  [derived]
        │
        ▼
usePokemonList("normal", { filterByName: "", filterByMinHeight: 10, filterByMaxHeight: 0 })
        │
        ├─► useDebounce(filterByName, 300)  [name filter only — no debounce for height]
        │
        ├─► useEffect [NO re-run — selectedType unchanged]
        │         rawList = [pidgey(h:3), pidgeotto(h:11), pidgeot(h:15)]  (unchanged)
        │
        └─► useMemo [re-runs when filterByMinHeight changes]
                  list = rawList                                         [no name filter]
                  list = filterPokemonsByHeightRange(list, 10, 0)
                       = [pidgeotto(h:11), pidgeot(h:15)]               [pidgey(h:3) excluded]
                  if sortByHeight → sortPokemonListByHeight(list)
                  return list
        │
        ▼
pokemonList = [pidgeotto, pidgeot]
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
| `application/use-cases/filter-pokemons-by-height-range/FilterPokemonsByHeightRangeUseCase.ts` | Created | Pure use case — handles 5 logic cases (both zero, min only, max only, valid range, invalid range) |
| `application/use-cases/filter-pokemons-by-height-range/__tests__/FilterPokemonsByHeightRangeUseCase.test.ts` | Created | TDD unit tests covering all 5 cases + boundary conditions |
| `application/view-models/PokemonListViewModel.ts` | Added `filterPokemonsByHeightRange()` | ViewModel delegates to use case, following the existing sort and name-filter pattern |
| `application/view-models/__tests__/PokemonListViewModel.test.ts` | Extended | Verify ViewModel delegates correctly |
| `infrastructure/react/hooks/useListControls.ts` | Added `filterByMinHeight`, `filterByMaxHeight`, `isInvalidHeightRange` | Local state (not Redux) for transient filter values; `isInvalidHeightRange` as derived, not state |
| `infrastructure/react/hooks/__tests__/useListControls.test.ts` | Extended | Verify initial values (0), setters, and `isInvalidHeightRange` derived behavior |
| `infrastructure/react/hooks/usePokemonList.ts` | Refactored to `ListFilters` object, updated `useMemo` pipeline | See decisions 2 and 3; detection changes from `typeof` to duck-typing |
| `infrastructure/react/hooks/__tests__/usePokemonList.filterByName.test.ts` | Updated calling convention | `(repo, "string")` → `(repo, { filterByName: "string" })` — mechanical change from ListFilters refactor |
| `infrastructure/react/hooks/__tests__/usePokemonList.filterByHeightRange.test.ts` | Created | TDD hook tests for height range filter behavior |
| `ui/PokemonListHeightRangeFilter.tsx` | Created | UI component per Julian's accessibility design — `<fieldset>`, sr-only labels, `role="alert"` validation |
| `ui/PokemonListControls.tsx` | Added 5 new props + render `<PokemonListHeightRangeFilter />` | Wires height range UI into the controls toolbar |
| `ui/PokemonListSection.tsx` | Added all new state, `hasActiveFilter`, combined empty state | Full wiring — passes ListFilters to hook, shows unified empty state for any active filter |
| `pages/Home/__tests__/helpers.ts` | Added `typeInMinHeightFilter()`, `typeInMaxHeightFilter()` | User action helpers — number inputs have ARIA role `spinbutton`, not `textbox` |
| `pages/Home/__tests__/Home.FilterByHeightRange.test.tsx` | Created | Integration tests written first (TDD outside-in): min only, min+max, empty state, validation alert |
