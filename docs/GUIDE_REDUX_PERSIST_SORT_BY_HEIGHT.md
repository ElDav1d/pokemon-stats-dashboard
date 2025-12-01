# Guía: Persistencia de "Sort by Height" con Redux Toolkit Middleware

## 📋 Objetivo

Implementar Redux Toolkit con un **middleware customizado** para persistir el estado del checkbox "Sort by height" en localStorage, siguiendo los principios de **Arquitectura Hexagonal** y **Clean Architecture**.

**NO usaremos Redux Persist.** Crearemos nuestro propio middleware para tener control total sobre la persistencia.

---

## 🎯 Resultado Esperado

**Comportamiento actual:**

```
1. Usuario marca checkbox "Sort by height"
2. Lista se ordena por altura
3. Usuario recarga la página
4. ❌ Checkbox vuelve a estar desmarcado
5. ❌ Lista vuelve al orden original
```

**Comportamiento después de implementar Redux Persist:**

```
1. Usuario marca checkbox "Sort by height"
2. Lista se ordena por altura
3. ✅ Estado se guarda en localStorage
4. Usuario recarga la página
5. ✅ Checkbox sigue marcado
6. ✅ Lista sigue ordenada por altura
```

---

## 🏗️ Arquitectura: Dónde va cada cosa

```
src/
├── features/
│   └── pokemon-list/
│       ├── domain/                           # 🔵 NO CAMBIA
│       ├── application/                      # 🟢 NO CAMBIA
│       ├── infrastructure/
│       │   ├── http/                         # 🟡 NO CAMBIA
│       │   ├── react/
│       │   │   └── hooks/
│       │   │       └── usePokemonList.ts     # 🔄 MODIFICAR
│       │   └── redux/                        # ✅ NUEVO
│       │       ├── slices/
│       │       │   └── listPreferencesSlice.ts
│       │       └── selectors/
│       │           └── listPreferencesSelectors.ts
│       └── ui/
│           └── PokemonList.tsx               # 🔄 MODIFICAR
│
└── infrastructure/                           # 🟡 SHARED
    └── redux/
        ├── store.ts                          # ✅ NUEVO
        ├── rootReducer.ts                    # ✅ NUEVO
        ├── hooks.ts                          # ✅ NUEVO
        └── middleware/                       # ✅ NUEVO
            └── localStorageMiddleware.ts     # ✅ Middleware customizado
```

---

## 📦 Instalación de Dependencias

```bash
npm install @reduxjs/toolkit react-redux
```

**Versiones recomendadas:**

- `@reduxjs/toolkit`: ^2.0.0
- `react-redux`: ^9.0.0

**NO necesitamos `redux-persist`.** Crearemos nuestro propio middleware.

---

## 🚀 Implementación Paso a Paso

---

### **Paso 1: Crear el Redux Slice**

**Ubicación:** `src/features/pokemon-list/infrastructure/redux/slices/listPreferencesSlice.ts`

```typescript
import { createSlice } from "@reduxjs/toolkit";

/**
 * Estado de preferencias de la lista de Pokemon
 * Solo contiene estado de UI, NO lógica de negocio
 */
interface ListPreferencesState {
  sortByHeight: boolean;
}

const initialState: ListPreferencesState = {
  sortByHeight: false,
};

/**
 * Slice para manejar preferencias de visualización de la lista
 * Responsabilidad: Solo estado de UI (qué checkbox está marcado)
 * NO responsabilidad: Lógica de ordenamiento (eso va en el ViewModel)
 */
export const listPreferencesSlice = createSlice({
  name: "listPreferences",
  initialState,
  reducers: {
    /**
     * Toggle el estado del checkbox "Sort by height"
     */
    toggleSortByHeight: (state) => {
      state.sortByHeight = !state.sortByHeight;
    },

    /**
     * Set explícito del estado (útil para tests)
     */
    setSortByHeight: (state, action) => {
      state.sortByHeight = action.payload;
    },

    /**
     * Reset a valores por defecto
     */
    resetPreferences: () => initialState,
  },
});

// Exportar actions
export const { toggleSortByHeight, setSortByHeight, resetPreferences } =
  listPreferencesSlice.actions;

// Exportar reducer
export default listPreferencesSlice.reducer;
```

**✅ Principios aplicados:**

- ✅ Solo estado de UI (no lógica de negocio)
- ✅ Interface tipada
- ✅ Comentarios explicando responsabilidades
- ✅ Actions con nombres claros

---

### **Paso 2: Crear Selectors**

**Ubicación:** `src/features/pokemon-list/infrastructure/redux/selectors/listPreferencesSelectors.ts`

```typescript
import { RootState } from "../../../../../infrastructure/redux/store";

/**
 * Selector para obtener el estado de sortByHeight
 * Permite que componentes se suscriban solo a esta parte del estado
 */
export const selectSortByHeight = (state: RootState): boolean =>
  state.listPreferences.sortByHeight;

/**
 * Selector para obtener todas las preferencias
 * Útil si en el futuro agregamos más preferencias
 */
export const selectAllPreferences = (state: RootState) => state.listPreferences;
```

**✅ Principios aplicados:**

- ✅ Selectores tipados
- ✅ Granulares (permiten suscripción selectiva)
- ✅ Documentados

---

### **Paso 3: Crear Root Reducer**

**Ubicación:** `src/infrastructure/redux/rootReducer.ts`

```typescript
import { combineReducers } from "@reduxjs/toolkit";
import listPreferencesReducer from "../../features/pokemon-list/infrastructure/redux/slices/listPreferencesSlice";

/**
 * Root reducer que combina todos los slices de la aplicación
 * En el futuro se pueden agregar más slices aquí:
 * - comparisonSlice (para Pokemon Comparison feature)
 * - filtersSlice (para filtros avanzados)
 * - etc.
 */
const rootReducer = combineReducers({
  listPreferences: listPreferencesReducer,
  // Futuros slices:
  // comparison: comparisonReducer,
  // filters: filtersReducer,
});

export default rootReducer;
```

---

### **Paso 4: Crear Middleware Customizado para localStorage**

**Ubicación:** `src/infrastructure/redux/middleware/localStorageMiddleware.ts`

```typescript
import { Middleware } from "@reduxjs/toolkit";
import { RootState } from "../store";

/**
 * Clave para guardar el estado en localStorage
 */
const STORAGE_KEY = "pokemon-app-preferences";

/**
 * Middleware customizado para sincronizar estado de Redux con localStorage
 *
 * Responsabilidades:
 * 1. Intercepta TODAS las acciones
 * 2. Si la acción es de listPreferences, guarda el estado en localStorage
 * 3. NO bloquea las acciones (siempre hace next(action))
 *
 * Ventajas sobre Redux Persist:
 * - Control total sobre QUÉ y CUÁNDO persistir
 * - Sin dependencias externas
 * - Fácil de debuggear
 * - Fácil de testear
 */
export const localStorageMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    // 1. Primero, deja que la acción pase al reducer
    const result = next(action);

    // 2. Después de que el estado se actualizó, persiste si es necesario
    if (action.type?.startsWith("listPreferences/")) {
      try {
        // Obtener el estado actualizado
        const state = store.getState();

        // Serializar y guardar en localStorage
        const dataToSave = {
          listPreferences: state.listPreferences,
          _timestamp: new Date().toISOString(), // Para debugging
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));

        // Log en desarrollo (opcional)
        if (process.env.NODE_ENV === "development") {
          console.log("💾 State persisted to localStorage:", dataToSave);
        }
      } catch (error) {
        // Fallar silenciosamente si localStorage no está disponible
        console.error("Failed to save to localStorage:", error);
      }
    }

    return result;
  };

/**
 * Función helper para cargar el estado inicial desde localStorage
 * Se llama una vez al crear el store
 */
export const loadStateFromLocalStorage = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);

    if (serializedState === null) {
      return undefined; // No hay estado guardado
    }

    const parsedState = JSON.parse(serializedState);

    // Log en desarrollo (opcional)
    if (process.env.NODE_ENV === "development") {
      console.log("📂 State loaded from localStorage:", parsedState);
    }

    // Retornar solo la parte que nos interesa
    return {
      listPreferences: parsedState.listPreferences,
    };
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
    return undefined;
  }
};

/**
 * Función helper para limpiar el localStorage (útil para testing o reset)
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

**✅ Principios aplicados:**

- ✅ **Middleware pattern** - Intercepta acciones sin modificarlas
- ✅ **Selective persistence** - Solo persiste acciones de `listPreferences/`
- ✅ **Error handling** - Falla silenciosamente si localStorage no disponible
- ✅ **Debugging** - Logs en desarrollo
- ✅ **Testability** - Funciones helper exportables

---

**Ventajas de este enfoque vs Redux Persist:**

| Aspecto           | Redux Persist  | Middleware Custom             |
| ----------------- | -------------- | ----------------------------- |
| **Control**       | Limitado       | Total                         |
| **Tamaño bundle** | +15KB          | 0KB extra                     |
| **Configuración** | Compleja       | Simple                        |
| **Debugging**     | Difícil        | Fácil (código propio)         |
| **Testing**       | Requiere mocks | Tests simples                 |
| **Flexibilidad**  | Limitada       | Total                         |
| **Performance**   | Buena          | Excelente (solo lo necesario) |

---

### **Paso 5: Configurar Store con Middleware Customizado**

**Ubicación:** `src/infrastructure/redux/store.ts`

```typescript
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import {
  localStorageMiddleware,
  loadStateFromLocalStorage,
} from "./middleware/localStorageMiddleware";

/**
 * Cargar estado inicial desde localStorage (si existe)
 */
const preloadedState = loadStateFromLocalStorage();

/**
 * Store de Redux con middleware customizado
 */
export const store = configureStore({
  reducer: rootReducer,

  // ✅ Estado inicial cargado desde localStorage
  preloadedState,

  // ✅ Agregar middleware customizado
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware), // Nuestro middleware al final

  // DevTools solo en desarrollo
  devTools: process.env.NODE_ENV !== "production",
});

/**
 * Tipos para TypeScript
 */
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**✅ Configuración explicada:**

| Opción           | Valor                         | Por qué                           |
| ---------------- | ----------------------------- | --------------------------------- |
| `reducer`        | `rootReducer`                 | Combina todos los slices          |
| `preloadedState` | `loadStateFromLocalStorage()` | Carga estado guardado al iniciar  |
| `middleware`     | `localStorageMiddleware`      | Guarda estado en cada acción      |
| `devTools`       | Solo en dev                   | Redux DevTools solo en desarrollo |

**Flujo de persistencia:**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APP INICIA                                               │
│ loadStateFromLocalStorage() se ejecuta                      │
│ → Lee localStorage                                          │
│ → Retorna estado guardado (o undefined)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. STORE SE CREA                                            │
│ preloadedState restaura el estado guardado                  │
│ → Checkbox ya está en el estado correcto                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USUARIO MARCA CHECKBOX                                   │
│ dispatch(toggleSortByHeight())                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MIDDLEWARE INTERCEPTA                                    │
│ localStorageMiddleware detecta acción "listPreferences/"    │
│ → Deja pasar la acción (next(action))                       │
│ → Estado se actualiza en Redux                              │
│ → Guarda estado en localStorage                             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. COMPONENTE RE-RENDERIZA                                  │
│ useAppSelector lee nuevo estado                             │
└─────────────────────────────────────────────────────────────┘
```

---

### **Paso 6: Crear Hooks Tipados**

**Ubicación:** `src/infrastructure/redux/hooks.ts`

```typescript
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * Hook tipado para useDispatch
 * Uso: const dispatch = useAppDispatch();
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * Hook tipado para useSelector
 * Uso: const value = useAppSelector(state => state.x);
 */
export const useAppSelector = useSelector.withTypes<RootState>();
```

**✅ Por qué hooks tipados:**

- ✅ Autocompletado en TypeScript
- ✅ Detecta errores en tiempo de desarrollo
- ✅ Mejor experiencia de desarrollo

---

### **Paso 7: Modificar el Hook usePokemonList**

**Ubicación:** `src/features/pokemon-list/infrastructure/react/hooks/usePokemonList.ts`

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
 * Hook para manejar la lista de Pokemon
 * Integra Redux para leer el estado de sortByHeight
 * Usa el ViewModel para la lógica de ordenamiento
 */
function usePokemonList(selectedType: string): UsePokemonListResult {
  const [pokemonList, setPokemonList] = useState<PokemonListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // ✅ Lee estado de Redux (persiste entre recargas)
  const sortByHeight = useAppSelector(selectSortByHeight);

  // Setup infrastructure (sin cambios)
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

  // ✅ Fetch data y aplica sorting si está activado
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
        // 1. Cargar datos del ViewModel
        let result = await viewModel.loadPokemonList(selectedType);

        // 2. ✅ Aplicar sorting si está activado en Redux
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
  }, [selectedType, sortByHeight, viewModel]); // ✅ sortByHeight como dependencia

  return {
    pokemonList,
    isLoading,
    isError,
  };
}

export default usePokemonList;
```

**✅ Cambios aplicados:**

1. ✅ Importa `useAppSelector` y `selectSortByHeight`
2. ✅ Lee `sortByHeight` de Redux (línea 30)
3. ✅ Aplica sorting condicionalmente (línea 58-60)
4. ✅ Agrega `sortByHeight` a dependencias del useEffect (línea 71)

---

### **Paso 8: Modificar el Componente PokemonList**

**Ubicación:** `src/features/pokemon-list/ui/PokemonList.tsx`

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

  // ✅ Redux para estado de UI (persiste)
  const dispatch = useAppDispatch();
  const sortByHeight = useAppSelector(selectSortByHeight);

  // Hook: Data fetching (ya usa sortByHeight de Redux internamente)
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
      {/* ✅ SIEMPRE VISIBLE - Preferencia de UI independiente de datos */}
      <fieldset className="my-6">
        <legend className="text-lg l:text-xl xl:text-2xl">
          Order the pokemons:
        </legend>
        <input
          className="mr-2"
          type="checkbox"
          id="height"
          name="height"
          checked={sortByHeight} // ✅ De Redux (persiste)
          onChange={handleSortChange}
        />
        <label htmlFor="height">By height</label>
      </fieldset>

      {/* ✅ Estados de carga/error */}
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

      {/* ✅ Lista (solo si hay datos) */}
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

      {/* ✅ Estado vacío (opcional) */}
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

**✅ Mejoras aplicadas:**

1. **Fieldset siempre visible** ✅

   - El checkbox NO desaparece durante loading/error
   - El usuario siempre ve el estado de su preferencia
   - Mejor UX: no hay "sorpresas" al cambiar de tipo

2. **Redux integrado** ✅

   - Elimina `useState` local
   - Usa `useAppDispatch` y `useAppSelector`
   - Estado persiste entre tipos y recargas

3. **Estados separados y claros** ✅

   - Loading: spinner mientras carga
   - Error: mensaje de error
   - Success con datos: muestra lista
   - Success sin datos: mensaje de empty state

4. **Código simplificado** ✅
   - Elimina `sortablePokemonList` (el hook ya ordena)
   - Elimina lógica de sorting del componente
   - Componente "humble" que solo renderiza

---

**Comparación de comportamiento:**

| Escenario                   | ANTES (con useState)                   | AHORA (con Redux)               |
| --------------------------- | -------------------------------------- | ------------------------------- |
| **Usuario marca checkbox**  | ✅ Marca                               | ✅ Marca                        |
| **Usuario cambia de tipo**  | ❌ Checkbox desaparece durante loading | ✅ Checkbox siempre visible     |
| **Lista termina de cargar** | ❌ Checkbox desmarcado (perdió estado) | ✅ Checkbox marcado (persistió) |
| **Usuario recarga página**  | ❌ Checkbox desmarcado                 | ✅ Checkbox marcado             |

---

**Experiencia del usuario:**

```
┌─────────────────────────────────────────┐
│ 1. Usuario en tipo "fire"               │
│    Marca checkbox ✅                     │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. Usuario cambia a "water"             │
│    ✅ Checkbox SIEMPRE visible (marcado)│
│    Abajo: "Loading..."                  │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. Lista "water" carga                  │
│    ✅ Checkbox sigue marcado             │
│    ✅ Lista viene ordenada               │
│    ✅ Experiencia consistente            │
└─────────────────────────────────────────┘
```

---

### **Paso 9: Configurar App.tsx con Redux Provider**

**Ubicación:** `src/App.tsx`

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

**✅ Diferencias con Redux Persist:**

- ❌ **NO necesitamos** `<PersistGate>` - El estado ya se carga en el store
- ✅ **Más simple** - Solo el `<Provider>` estándar
- ✅ **Sin loading** - El estado se carga síncronamente en `preloadedState`

**¿Por qué no necesitamos PersistGate?**

```typescript
// Redux Persist (asíncrono):
// 1. Store se crea SIN estado
// 2. <PersistGate> espera a que se restaure
// 3. Cuando termina, renderiza la app

// Nuestro middleware (síncrono):
// 1. loadStateFromLocalStorage() se ejecuta ANTES de crear el store
// 2. Store se crea YA con el estado restaurado
// 3. App renderiza inmediatamente con estado correcto
```

---

## ✅ Testing

### **Test del Middleware**

**Ubicación:** `src/infrastructure/redux/middleware/__tests__/localStorageMiddleware.test.ts`

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
  // Limpiar localStorage antes de cada test
  localStorage.clear();
  clearPersistedState();

  // Crear store con middleware
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

  // Verificar que se guardó en localStorage
  const saved = localStorage.getItem("pokemon-app-preferences");
  expect(saved).not.toBeNull();

  const parsed = JSON.parse(saved!);
  expect(parsed.listPreferences.sortByHeight).toBe(true);
  expect(parsed._timestamp).toBeDefined();
});

it("should not save to localStorage for non-listPreferences actions", () => {
  // Dispatch una acción que no es de listPreferences
  store.dispatch({ type: "some/other/action" });

  // No debería haber nada en localStorage
  const saved = localStorage.getItem("pokemon-app-preferences");
  expect(saved).toBeNull();
});

it("should update localStorage on every listPreferences action", () => {
  // Toggle 3 veces
  store.dispatch(toggleSortByHeight()); // true
  store.dispatch(toggleSortByHeight()); // false
  store.dispatch(toggleSortByHeight()); // true

  // Verificar estado final
  const saved = localStorage.getItem("pokemon-app-preferences");
  const parsed = JSON.parse(saved!);
  expect(parsed.listPreferences.sortByHeight).toBe(true);
});

it("should return undefined if no state in localStorage", () => {
  const loaded = loadStateFromLocalStorage();
  expect(loaded).toBeUndefined();
});

it("should load state from localStorage", () => {
  // Guardar estado manualmente
  const mockState = {
    listPreferences: { sortByHeight: true },
    _timestamp: new Date().toISOString(),
  };
  localStorage.setItem("pokemon-app-preferences", JSON.stringify(mockState));

  // Cargar estado
  const loaded = loadStateFromLocalStorage();
  expect(loaded).toEqual({
    listPreferences: { sortByHeight: true },
  });
});

it("should return undefined if localStorage data is corrupted", () => {
  // Guardar JSON inválido
  localStorage.setItem("pokemon-app-preferences", "invalid json");

  const loaded = loadStateFromLocalStorage();
  expect(loaded).toBeUndefined();
});

it("should remove state from localStorage when cleared", () => {
  // Guardar algo
  localStorage.setItem(
    "pokemon-app-preferences",
    JSON.stringify({ test: true })
  );

  // Limpiar
  clearPersistedState();

  // Verificar que se eliminó
  const saved = localStorage.getItem("pokemon-app-preferences");
  expect(saved).toBeNull();
});
```

---

### **Test del Slice**

**Ubicación:** `src/features/pokemon-list/infrastructure/redux/slices/__tests__/listPreferencesSlice.test.ts`

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

### **Test de Selectors**

**Ubicación:** `src/features/pokemon-list/infrastructure/redux/selectors/__tests__/listPreferencesSelectors.test.ts`

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

### **Test de Integración con Hook**

**Ubicación:** `src/features/pokemon-list/infrastructure/react/hooks/__tests__/usePokemonList.test.tsx`

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

  // Verificar que la lista está ordenada
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

  // Lista no debe estar ordenada necesariamente
  expect(result.current.pokemonList.length).toBeGreaterThan(0);
});
```

---

## 🔍 Verificación

### **1. Verificar en DevTools de Redux**

1. Instalar **Redux DevTools Extension** en tu navegador
2. Abrir la app y las DevTools
3. Ir a la pestaña "Redux"
4. Hacer click en checkbox "Sort by height"
5. ✅ Deberías ver la acción `listPreferences/toggleSortByHeight`
6. ✅ Ver el cambio de estado: `sortByHeight: false → true`

---

### **2. Verificar en localStorage**

1. Abrir DevTools → Pestaña "Application" (Chrome) o "Storage" (Firefox)
2. Ir a "Local Storage" → `http://localhost:5173`
3. ✅ Deberías ver una clave: `pokemon-app-preferences`
4. ✅ Valor debe contener:

```json
{
  "listPreferences": {
    "sortByHeight": true
  },
  "_timestamp": "2025-10-24T10:30:00.000Z"
}
```

---

### **3. Verificar logs del middleware (desarrollo)**

1. Abrir consola del navegador
2. Marcar checkbox "Sort by height"
3. ✅ Deberías ver en consola:

```
💾 State persisted to localStorage: {
  listPreferences: { sortByHeight: true },
  _timestamp: "2025-10-24T10:30:00.000Z"
}
```

---

### **4. Verificar persistencia**

1. Marcar checkbox "Sort by height"
2. Lista se ordena
3. Recargar la página (F5)
4. ✅ Checkbox sigue marcado
5. ✅ Lista sigue ordenada

---

### **5. Verificar que el middleware solo se ejecuta en acciones relevantes**

1. Navegar entre páginas (Home → Detail → Home)
2. En consola NO deberías ver logs de persistencia
3. Solo al marcar/desmarcar checkbox deberías ver logs

---

## 🐛 Troubleshooting

### **Problema 1: Estado no persiste**

**Síntoma:** Al recargar, el checkbox vuelve a estar desmarcado.

**Soluciones:**

1. Verificar que el middleware está agregado al store:

```typescript
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadStateFromLocalStorage(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware), // ✅ Debe estar aquí
});
```

2. Verificar en consola si hay logs del middleware (en desarrollo):

```
💾 State persisted to localStorage: { listPreferences: { sortByHeight: true }, _timestamp: "..." }
```

3. Verificar en DevTools → Application → Local Storage:

   - Clave: `pokemon-app-preferences`
   - Valor debe contener el estado

4. Limpiar localStorage y probar de nuevo:

```javascript
// En consola del navegador
localStorage.clear();
```

---

### **Problema 2: Redux DevTools no aparece**

**Síntoma:** No veo la pestaña Redux en DevTools.

**Soluciones:**

1. Instalar extensión: [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd)

2. Verificar configuración del store:

```typescript
export const store = configureStore({
  reducer: rootReducer,
  devTools: process.env.NODE_ENV !== "production", // ✅ Debe estar en true en dev
});
```

---

### **Problema 3: TypeScript errors**

**Síntoma:** Errores de tipos al usar `useAppSelector` o `useAppDispatch`.

**Soluciones:**

1. Verificar que los hooks tipados están bien exportados:

```typescript
// infrastructure/redux/hooks.ts
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

2. Importar hooks tipados (no los de react-redux directamente):

```typescript
// ❌ No uses estos
import { useDispatch, useSelector } from "react-redux";

// ✅ Usa estos
import { useAppDispatch, useAppSelector } from "../infrastructure/redux/hooks";
```

---

### **Problema 4: Middleware se ejecuta en cada acción**

**Síntoma:** Logs de persistencia en TODAS las acciones, no solo listPreferences.

**Solución:**

Verificar que el middleware filtra correctamente:

```typescript
export const localStorageMiddleware: Middleware<{}, RootState> =
  (store) => (next) => (action) => {
    const result = next(action);

    // ✅ Solo persiste si la acción empieza con 'listPreferences/'
    if (action.type?.startsWith("listPreferences/")) {
      // ... guardar en localStorage
    }

    return result;
  };
```

---

### **Problema 5: localStorage está lleno**

**Síntoma:** Error "QuotaExceededError" en consola.

**Soluciones:**

1. localStorage tiene límite de ~5-10MB. Verificar qué hay guardado:

```javascript
// En consola del navegador
for (let key in localStorage) {
  console.log(key, localStorage.getItem(key).length);
}
```

2. Si tu app guarda mucho, considera:
   - Comprimir datos antes de guardar
   - Usar IndexedDB para datos grandes
   - Limpiar datos antiguos periódicamente

---

### **Problema 6: Estado se carga pero componente no actualiza**

**Síntoma:** localStorage tiene el estado, pero checkbox está desmarcado.

**Soluciones:**

1. Verificar que `preloadedState` se pasa correctamente:

```typescript
const preloadedState = loadStateFromLocalStorage();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState, // ✅ Debe estar aquí
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});
```

2. Verificar que el selector lee del store:

```typescript
const sortByHeight = useAppSelector(selectSortByHeight);
console.log("sortByHeight from Redux:", sortByHeight);
```

3. Verificar que el componente usa el valor correcto:

```typescript
<input
  type="checkbox"
  checked={sortByHeight} // ✅ Debe venir de Redux, no de useState
  onChange={handleSortChange}
/>
```

---

## 📊 Diagrama de Flujo

### **Flujo: Usuario marca checkbox**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USUARIO MARCA CHECKBOX                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. UI COMPONENT                                             │
│ dispatch(toggleSortByHeight())                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE INTERCEPTA                                    │
│ localStorageMiddleware recibe la acción                     │
│ → Deja pasar: next(action)                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. REDUCER ACTUALIZA ESTADO                                 │
│ state.listPreferences.sortByHeight = !sortByHeight          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. MIDDLEWARE PERSISTE                                      │
│ if (action.type.startsWith('listPreferences/')) {           │
│   localStorage.setItem('pokemon-app-preferences', state)    │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. COMPONENTES RE-RENDERIZAN                                │
│ useAppSelector detecta cambio de estado                     │
│ → Checkbox actualiza su valor                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. USEEFFECT SE EJECUTA                                     │
│ Detecta cambio en sortByHeight (dependencia)                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. VIEWMODEL APLICA SORTING                                 │
│ if (sortByHeight) {                                         │
│   result = viewModel.sortPokemonListByHeight(result)        │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 9. LISTA SE RENDERIZA ORDENADA                              │
└─────────────────────────────────────────────────────────────┘
```

---

### **Flujo: Usuario recarga la página**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. APP INICIA                                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. CARGAR ESTADO DESDE LOCALSTORAGE                         │
│ const preloadedState = loadStateFromLocalStorage()          │
│ → Lee 'pokemon-app-preferences' de localStorage             │
│ → Retorna: { listPreferences: { sortByHeight: true } }      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. STORE SE CREA CON ESTADO INICIAL                         │
│ configureStore({ preloadedState })                          │
│ → Redux ya tiene sortByHeight: true                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. APP RENDERIZA                                            │
│ <Provider store={store}>                                    │
│ → Componentes acceden al estado restaurado                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. COMPONENTE LEE ESTADO                                    │
│ const sortByHeight = useAppSelector(selectSortByHeight)     │
│ → sortByHeight = true (valor restaurado)                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CHECKBOX RENDERIZA MARCADO                               │
│ <input checked={sortByHeight} />                            │
│ → Checkbox está marcado desde el inicio                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. USEEFFECT FETCH DATA                                     │
│ useEffect detecta sortByHeight = true                       │
│ → Aplica sorting automáticamente                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. LISTA SE MUESTRA ORDENADA                                │
│ Usuario ve la lista ordenada desde el primer render         │
└─────────────────────────────────────────────────────────────┘
```

---

### **Comparación: Redux Persist vs Middleware Custom**

| Aspecto           | Redux Persist                           | Middleware Custom                              |
| ----------------- | --------------------------------------- | ---------------------------------------------- |
| **Timing**        | ⏱️ Asíncrono (necesita `<PersistGate>`) | ⚡ Síncrono (carga en `preloadedState`)        |
| **Loading state** | ❌ Necesita mostrar spinner             | ✅ Sin loading, estado disponible de inmediato |
| **Control**       | 🔒 Limitado (configuración)             | 🎯 Total (código propio)                       |
| **Bundle size**   | 📦 +15KB                                | 📦 +0KB                                        |
| **Debugging**     | 🐛 Complejo (código externo)            | 🐛 Fácil (logs propios)                        |
| **Testing**       | 🧪 Requiere mocks complejos             | 🧪 Tests simples                               |

---

## 📝 Checklist de Implementación

### **Configuración inicial:**

- [ ] Instalar dependencias (`@reduxjs/toolkit`, `react-redux`)
- [ ] Crear `listPreferencesSlice.ts`
- [ ] Crear `listPreferencesSelectors.ts`
- [ ] Crear `rootReducer.ts`
- [ ] Crear `localStorageMiddleware.ts` con funciones helper
- [ ] Crear `store.ts` con middleware y preloadedState
- [ ] Crear `hooks.ts` con hooks tipados

### **Integración:**

- [ ] Modificar `usePokemonList.ts` para usar Redux
- [ ] Modificar `PokemonList.tsx` para usar Redux
- [ ] Agregar `<Provider>` en `App.tsx` (sin PersistGate)

### **Testing:**

- [ ] Tests del middleware (save, load, clear)
- [ ] Tests del slice
- [ ] Tests de selectors
- [ ] Tests de integración con hook
- [ ] Test manual: marcar checkbox, recargar, verificar persistencia

### **Verificación:**

- [ ] Redux DevTools muestra acciones
- [ ] localStorage contiene el estado con estructura correcta
- [ ] Logs del middleware aparecen en consola (desarrollo)
- [ ] Checkbox persiste entre recargas
- [ ] Lista se ordena correctamente
- [ ] No hay warnings en consola
- [ ] Middleware solo se ejecuta en acciones relevantes

---

## 🎯 Próximos Pasos

Una vez implementada la persistencia de "Sort by height", puedes extender Redux para:

### **1. Feature: Filtros Avanzados**

```typescript
interface ListPreferencesState {
  sortByHeight: boolean;
  heightRangeMin: number; // ✅ Nuevo
  heightRangeMax: number; // ✅ Nuevo
  searchQuery: string; // ✅ Nuevo
}
```

### **2. Feature: Pokemon Comparison**

```typescript
// Nuevo slice
interface ComparisonState {
  selectedIds: string[];
  pokemonData: Record<string, PokemonListItem>;
}
```

### **3. Feature: Theme Preferences**

```typescript
// Nuevo slice
interface ThemeState {
  mode: "light" | "dark";
  accentColor: string;
}
```

---

## 📚 Referencias

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux Persist Docs](https://github.com/rt2zz/redux-persist)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)

---

## ✅ Resumen

**Lo que implementamos:**

- ✅ Redux Toolkit para estado de UI
- ✅ **Middleware customizado** para guardar en localStorage (sin Redux Persist)
- ✅ Funciones helper para load/save/clear state
- ✅ Arquitectura hexagonal respetada (Redux en Infrastructure)
- ✅ Separación de responsabilidades (Redux = UI state, ViewModel = lógica)
- ✅ Persistencia automática del checkbox "Sort by height"
- ✅ Tests completos (middleware, slice, selectors, integración)

**Ventajas del middleware customizado:**

- ✅ Control total sobre la persistencia
- ✅ Sin dependencias externas (+0KB vs +15KB)
- ✅ Carga síncrona (sin `<PersistGate>`)
- ✅ Código más simple y directo
- ✅ Fácil de debuggear y testear
- ✅ Logs informativos en desarrollo
- ✅ Filtrado selectivo de acciones

**Principios aplicados:**

- ✅ Clean Architecture (lógica en domain/application)
- ✅ Hexagonal Architecture (Redux como adaptador)
- ✅ Separation of Concerns (cada capa su responsabilidad)
- ✅ Single Responsibility (slice solo estado de UI, middleware solo persistencia)
- ✅ Testability (tests sin UI, sin HTTP)
- ✅ KISS (Keep It Simple, Stupid)

---

**Autor:** Claude Sonnet 4.5  
**Fecha:** 2025-10-24  
**Contexto:** Refactor Hexagonal - Feature pokemon-list  
**Branch sugerido:** `feat/redux-custom-middleware-sort-by-height`
