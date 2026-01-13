# Naming Inconsistencies Analysis

This document identifies naming inconsistencies in the codebase that could cause confusion in upcoming implementations or refactors.

---

## Critical Issues

### 1. File Name Typo

**Location**: `src/features/pokemon-list/application/use-cases/sort-pokemon-list-by-height/SortPokemonLIstByHeightUseCase.ts`

- File has typo: `SortPokemonLIstByHeightUseCase.ts` (capital "LI" instead of "Li")
- Class inside is correct: `SortPokemonsByHeightUseCase`
- **Fix**: Rename file to `SortPokemonsByHeightUseCase.ts`

---

### 2. DTO Naming Inconsistency Across Features

| Feature | Convention Used | Examples |
|---------|----------------|----------|
| pokemon-list | `Raw{Entity}` | `RawPokemonItem`, `RawPokemonReference` |
| pokemon-detail | `{Entity}Response` | `PokemonDetailResponse`, `StatResponse` |
| select-pokemon-type | Inline `{Entity}Response` | `TypeResponse` |

**Why confusing**: Both `Raw` and `Response` mean "direct API response" - new developers won't know which convention to follow.

**Fix**: Standardize on one convention (recommend `Raw{Entity}` since that's what pokemon-list uses consistently now)

---

### 3. Hook Return Interface Naming

| Hook | Interface Name | Style |
|------|---------------|-------|
| `usePokemonTypes` | `IUsePokemonTypesReturn` | Old I-prefix convention |
| `usePokemonList` | `UsePokemonListResult` | Modern style |
| `usePokemonDetail` | `UsePokemonDetailResult` | Modern style |

**Fix**: Rename `IUsePokemonTypesReturn` → `UsePokemonTypesResult`

---

### 4. Repository Method Naming Mismatch

```typescript
// pokemon-list: Method name suggests plural, returns singular
findDetailsByName(name: string): Promise<PokemonItem>  // "Details" but returns ONE item

// pokemon-detail: Correct pattern
findByName(name: string): Promise<PokemonDetail>       // Clear singular
```

**Fix**: Rename `findDetailsByName` → `findByName` (or `findProfileByName`)

---

## Moderate Issues

### 5. Orphaned File at Feature Root

**Location**: `src/features/pokemon-detail/entities.ts`

- Contains `IEvolutionChainLink` interface (uses old I-prefix)
- Sits at feature root instead of proper layer (`domain/` or `infrastructure/`)
- Same type exists in DTO layer as `EvolutionChainLink`

**Fix**: Move to appropriate layer or consolidate with existing DTO

---

## Summary: Recommended Actions

| Priority | Issue | Action |
|----------|-------|--------|
| Critical | File typo | Rename `SortPokemonLIstByHeightUseCase.ts` → `SortPokemonsByHeightUseCase.ts` |
| Critical | DTO naming | Standardize `pokemon-detail` DTOs to use `Raw{Entity}` convention |
| Moderate | Hook interface | Rename `IUsePokemonTypesReturn` → `UsePokemonTypesResult` |
| Moderate | Repository method | Rename `findDetailsByName` → `findByName` |
| Minor | Orphaned file | Move/consolidate `entities.ts` |

---

## Action Plan

### Phase 1 - Critical Fixes (Prevent future bugs)

1. Rename `SortPokemonLIstByHeightUseCase.ts` → `SortPokemonsByHeightUseCase.ts`
2. Standardize DTO naming: Adopt `Raw{Entity}` convention in `pokemon-detail` feature
3. Standardize hook return interface naming: Remove I-prefix, use `{Hook}Result` pattern

### Phase 2 - Moderate Fixes (Improve clarity)

4. Rename `PokemonRepository.findDetailsByName()` → `findByName()`
5. Move/clarify `pokemon-detail/entities.ts` file purpose

### Phase 3 - Documentation (Guidance for future)

6. Update CLAUDE.md with explicit naming conventions for:
   - DTOs: When to use `Raw` prefix
   - Repository methods: Naming patterns for find/get operations
   - Hooks: Interface naming conventions (no I-prefix, use `Result` suffix)
