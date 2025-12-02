# 🔧 Corrección: Feature `select-pokemon-type`

## 📊 RESUMEN EJECUTIVO

### **Puntuación: 8/10** 🟢

**Fortalezas:**

- ✅ Arquitectura hexagonal correcta (capas bien separadas)
- ✅ Dependency Rule respetada
- ✅ Value Object compartido (`PokemonType`) bien ubicado
- ✅ Tests unitarios de Use Case y Repository bien hechos
- ✅ Use Case trivial pero arquitectónicamente correcto

**Debilidades:**

- ❌ **Crítico:** Hook `usePokemonTypes` no sigue patrón de overloads para inyección de dependencias
- ⚠️ Componente crea infrastructure (consecuencia del punto anterior)
- ⚠️ Falta test de `useSelectPokemonType`
- ⚠️ Tests de página incompletos (solo happy path)

---

## 🎯 PLAN DE ACCIÓN

Ejecuta los siguientes prompts **en orden secuencial**. No continúes al siguiente hasta que el anterior esté completado y verificado.

---

## ✅ PASO 1: Refactor Hook `usePokemonTypes` con Overloads

### **Objetivo:**

Implementar el patrón de overloads en `usePokemonTypes` para permitir:

- **Producción:** El hook crea su propio repository internamente
- **Testing:** Inyectar un mock repository desde los tests

### **Prompt para el agente:**

```
Refactoriza el hook usePokemonTypes en src/features/select-pokemon-type/infrastructure/react/hooks/usePokemonTypes.tsx para seguir el mismo patrón de overloads que usePokemonList.

REQUISITOS:

1. Crear dos overloads de función:
   - Overload 1 (producción): usePokemonTypes(): IUsePokemonTypesReturn
   - Overload 2 (testing): usePokemonTypes(repository: PokemonTypesRepository): IUsePokemonTypesReturn

2. En la implementación:
   - Usar useMemo para crear HttpPokemonTypesRepository solo si no se inyecta repository
   - Importar url desde '../../lib/constants' para la baseUrl
   - El repository a usar será: repository || defaultRepository
   - Mantener toda la lógica existente de useEffect, isMounted, loading y error

3. NO cambiar:
   - La interfaz IUsePokemonTypesReturn
   - La lógica de GetPokemonTypesUseCase
   - El mapeo de types.map((type) => type.value)
   - La limpieza del useEffect con isMounted

4. Verificar que los tests existentes en __tests__/usePokemonTypes.test.ts sigan pasando sin modificaciones.

REFERENCIA:
Ver src/features/pokemon-list/infrastructure/react/hooks/usePokemonList.ts líneas 14-26 para el patrón correcto de overloads.
```

### **Verificación:**

```bash
npm test src/features/select-pokemon-type/infrastructure/react/hooks/__tests__/usePokemonTypes.test.ts
```

**Resultado esperado:** ✅ Todos los tests pasan sin modificaciones

---

## ✅ PASO 2: Eliminar Creación de Repository en Componente

### **Objetivo:**

El componente `SelectPokemonType` no debe crear infrastructure directamente.

### **Prompt para el agente:**

```
Simplifica el componente SelectPokemonType en src/features/select-pokemon-type/SelectPokemonType.tsx eliminando la creación del repository.

CAMBIOS REQUERIDOS:

1. Eliminar estas líneas:
   - const repository = useMemo(() => new HttpPokemonTypesRepository(url.BASE), []);
   - La importación de useMemo
   - La importación de HttpPokemonTypesRepository
   - La importación de url

2. Cambiar la llamada al hook:
   ANTES: const { typeNames, isLoading, isError } = usePokemonTypes(repository);
   DESPUÉS: const { typeNames, isLoading, isError } = usePokemonTypes();

3. Mantener intacto:
   - useSelectPokemonType
   - handleButtonClick
   - Todo el JSX del return

RESULTADO ESPERADO:
El componente debe tener estas importaciones finales:
- useCallback from 'react'
- SelectButton, SelectButtonList, LoadingMessage, ErrorMessage from '../../ui'
- DEFAULT_POKEMON_TYPE from './domain/constants'
- usePokemonTypes, useSelectPokemonType from './infrastructure/react/hooks'
```

### **Verificación:**

```bash
npm test src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx
```

**Resultado esperado:** ✅ Test de integración sigue pasando

---

## ✅ PASO 3: Agregar Tests de `useSelectPokemonType`

### **Objetivo:**

Probar el hook `useSelectPokemonType` que maneja la lógica de URL params con React Router.

### **Prompt para el agente:**

```
Crea tests para useSelectPokemonType en src/features/select-pokemon-type/infrastructure/react/hooks/__tests__/useSelectPokemonType.test.ts

ESTRUCTURA DEL ARCHIVO:

import { renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { it, expect } from "vitest";
import useSelectPokemonType from "../useSelectPokemonType";

TESTS REQUERIDOS:

1. it("returns selected type from URL params")
   - Wrapper: MemoryRouter con initialEntries={["/?type=fire"]}
   - Hook: useSelectPokemonType("normal")
   - Assert: selectedTypeParam toBe("fire")

2. it("sets default type when no type in URL")
   - Wrapper: MemoryRouter con initialEntries={["/"]}
   - Hook: useSelectPokemonType("normal")
   - Assert: selectedTypeParam toBe("normal") después de waitFor

3. it("updates URL when selectType is called")
   - Wrapper: MemoryRouter con initialEntries={["/?type=normal"]}
   - Hook: useSelectPokemonType("normal")
   - Act: result.current.selectType("fire")
   - Assert: selectedTypeParam toBe("fire") después de waitFor

PATRÓN DE WRAPPER:
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={["/?type=fire"]}>
    {children}
  </MemoryRouter>
);

IMPORTANTE:
- Usa renderHook de @testing-library/react
- Usa waitFor para cambios de estado asíncronos
- Usa act() para llamadas a selectType
- NO uses describe() blocks, solo it() statements
```

### **Verificación:**

```bash
npm test src/features/select-pokemon-type/infrastructure/react/hooks/__tests__/useSelectPokemonType.test.ts
```

**Resultado esperado:** ✅ 3 tests pasan

---

## ✅ PASO 4: Completar Tests de Página (Loading y Error)

### **Objetivo:**

Agregar tests de estados de loading y error para completar la cobertura de integración.

### **Prompt para el agente:**

```
Agrega tests de loading y error al archivo src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx

TESTS A AGREGAR (al final del archivo existente):

1. it("shows loading message when fetching pokemon types")
   - Mock fetch con Promise que resuelve después de 100ms
   - Render: <MemoryRouter><Home /></MemoryRouter>
   - Assert: heading con /loading pokemon types/i está en el documento
   - Assert: después de waitFor (200ms), el loading desaparece

2. it("shows error message when fetch fails")
   - Mock fetch que retorna { ok: false, status: 500 }
   - Render: <MemoryRouter><Home /></MemoryRouter>
   - Assert: después de waitFor, heading con /error loading pokemon types/i está en el documento

SETUP NECESARIO:
- beforeEach con vi.spyOn(console, 'error').mockImplementation(() => {})
- afterEach con vi.restoreAllMocks()

PATRÓN DE FETCH MOCK PARA LOADING:
global.fetch = vi.fn(() =>
  new Promise(resolve =>
    setTimeout(() => resolve({
      ok: true,
      json: async () => ({ results: [] })
    }), 100)
  )
);

PATRÓN DE FETCH MOCK PARA ERROR:
global.fetch = vi.fn(() => Promise.resolve({
  ok: false,
  status: 500
}));

IMPORTANTE:
- NO uses describe() blocks
- Usa waitFor con timeout adecuado para loading (200ms mínimo)
- Suprime console.error en beforeEach para tests de error
```

### **Verificación:**

```bash
npm test src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx
```

**Resultado esperado:** ✅ 3 tests pasan (1 existente + 2 nuevos)

---

## 🎉 VERIFICACIÓN FINAL

### **Ejecutar Suite Completa de Tests:**

```bash
# Tests de la feature completa
npm test src/features/select-pokemon-type

# Tests de integración en página
npm test src/pages/Home/__tests__/Home.SelectPokemonType.test.tsx

# Verificar que no rompimos pokemon-list
npm test src/features/pokemon-list
```

### **Checklist de Éxito:**

- [ ] ✅ `usePokemonTypes` tiene overloads (producción + testing)
- [ ] ✅ `SelectPokemonType` NO crea repository
- [ ] ✅ `useSelectPokemonType` tiene 3 tests
- [ ] ✅ Página tiene tests de loading y error
- [ ] ✅ Todos los tests de `select-pokemon-type` pasan
- [ ] ✅ Tests de `pokemon-list` siguen pasando
- [ ] ✅ Tests de integración en `Home` pasan

---

## 📋 ACTUALIZACIÓN DE CLAUDE.md

Para evitar estos errores en futuras implementaciones, agrega la siguiente sección a tu `CLAUDE.md`:

---

## 🆕 SECCIÓN NUEVA PARA CLAUDE.md

### **Ubicación:** Después de `## React Hook Architecture`

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

## 📝 NOTAS FINALES

### **Para tu agente:**

1. **Siempre revisa hooks similares existentes** antes de implementar uno nuevo
2. **Inyección de dependencias es crítica** para testabilidad
3. **Componentes NO crean infrastructure** - eso va en hooks
4. **Tests deben cubrir:** happy path, loading, error

### **Para ti (David):**

Este patrón de overloads es **fundamental** para mantener:
- ✅ Componentes "humble" (solo orquestan)
- ✅ Hooks testeables en aislamiento
- ✅ Infrastructure oculta del componente
- ✅ Flexibilidad para cambiar implementación sin tocar UI

**Referencia siempre:** `usePokemonList` es tu hook "dorado" - todos los demás hooks con infrastructure deben seguir ese patrón exacto.

---

## 🎯 RESULTADO ESPERADO POST-CORRECCIÓN

```

src/features/select-pokemon-type/
├── infrastructure/
│ └── react/
│ └── hooks/
│ ├── usePokemonTypes.tsx ← ✅ Con overloads
│ └── **tests**/
│ ├── usePokemonTypes.test.ts ← ✅ Pasan sin cambios
│ └── useSelectPokemonType.test.ts ← ✅ 3 tests nuevos
│
├── SelectPokemonType.tsx ← ✅ NO crea repository
│
└── ...

src/pages/Home/**tests**/
└── Home.SelectPokemonType.test.tsx ← ✅ 3 tests (1 + 2 nuevos)

```

**Test Count:**
- Select-pokemon-type feature: 8 tests (5 existentes + 3 nuevos)
- Home integration: 3 tests (1 existente + 2 nuevos)
- **Total nuevos:** 5 tests

---

**Autor:** Ricardo (Claude Sonnet 4.5)
**Fecha:** 2025-11-07
**Contexto:** Auditoría feature select-pokemon-type desarrollada por agente
**Próxima feature:** Aplicar estos aprendizajes desde el inicio
```
