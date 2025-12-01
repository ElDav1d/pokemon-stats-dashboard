# Guía: Desarrollo de Features con Arquitectura Hexagonal

## 📋 Objetivo

Esta guía te enseña a desarrollar **cualquier nueva feature** en el proyecto siguiendo los principios de **Arquitectura Hexagonal** y **Clean Architecture**, usando como referencia la feature `pokemon-list`.

---

## 🎯 Principios Fundamentales

### **1. Dependency Rule (Regla de Dependencia)**

```
UI → Infrastructure → Application → Domain
```

**Regla de oro:** Las dependencias SIEMPRE apuntan hacia adentro.

```typescript
// ✅ CORRECTO
Domain/Entity.ts  // No importa nada
Application/UseCase.ts  // Importa Domain
Infrastructure/Repository.ts  // Importa Domain
UI/Component.tsx  // Importa Infrastructure

// ❌ INCORRECTO
Domain/Entity.ts  // Importa fetch, React, Redux ← ¡NO!
```

---

### **2. Separation of Concerns (Separación de Responsabilidades)**

Cada capa tiene UNA responsabilidad clara:

| Capa | Responsabilidad | Qué contiene | Qué NO contiene |
|------|----------------|--------------|-----------------|
| **Domain** | Reglas de negocio puras | Entidades, Value Objects, Ports | React, HTTP, Redux |
| **Application** | Orquestar domain | Use Cases, ViewModels | React, HTTP, Redux |
| **Infrastructure** | Adaptadores técnicos | HTTP, React hooks, Redux | Lógica de negocio |
| **UI** | Presentación | Componentes React | Lógica de negocio, HTTP |

---

### **3. Ports & Adapters (Puertos y Adaptadores)**

```
┌─────────────────────────────────────────┐
│ DOMAIN define PORTS (interfaces)        │
│ "Necesito un repositorio que me dé X"   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ INFRASTRUCTURE implementa ADAPTERS      │
│ "Yo implemento ese port con HTTP"       │
└─────────────────────────────────────────┘
```

**Ejemplo:**
```typescript
// Domain define el PORT
export interface PokemonRepository {
  findAllByType(type: PokemonType): Promise<PokemonListItem[]>;
}

// Infrastructure implementa el ADAPTER
export class HttpPokemonRepository implements PokemonRepository {
  async findAllByType(type: PokemonType): Promise<PokemonListItem[]> {
    // Implementación con HTTP
  }
}
```

---

## 📂 Estructura de Carpetas por Feature

```
src/
├── features/
│   └── [feature-name]/
│       ├── domain/                    # 🔵 CAPA 1: Reglas de negocio
│       │   ├── entities/              # Objetos ricos con comportamiento
│       │   ├── value-objects/         # Objetos inmutables con validación
│       │   ├── ports/                 # Interfaces (contratos)
│       │   └── constants/             # Constantes del dominio
│       │
│       ├── application/               # 🟢 CAPA 2: Casos de uso
│       │   ├── use-cases/             # Lógica de aplicación
│       │   │   └── [use-case-name]/
│       │   │       ├── [UseCase].ts
│       │   │       └── [UseCase].test.ts
│       │   └── view-models/           # Coordinadores de UI
│       │       └── [ViewModel].ts
│       │
│       ├── infrastructure/            # 🟡 CAPA 3: Adaptadores
│       │   ├── http/                  # Adaptador HTTP
│       │   │   └── Http[Name]Repository.ts
│       │   ├── react/                 # Adaptador React
│       │   │   └── hooks/
│       │   │       └── use[Name].ts
│       │   └── redux/                 # Adaptador Redux (opcional)
│       │       ├── slices/
│       │       └── selectors/
│       │
│       └── ui/                        # 🔴 CAPA 4: Presentación
│           ├── [FeatureName].tsx      # Componente principal
│           └── [ComponentName].tsx    # Subcomponentes
│
└── infrastructure/                    # 🟡 SHARED (toda la app)
    ├── client/
    │   └── fetch/
    │       └── FetchHttpClient.ts
    ├── react/
    │   └── hooks/
    └── redux/
        ├── store.ts
        └── hooks.ts
```

---

## 🚀 Paso a Paso: Desarrollar una Nueva Feature

Vamos a desarrollar una feature hipotética: **"Pokemon Favorites"** (marcar Pokemon como favoritos).

---

---

## ❓ **Aclaración Importante: ¿Por qué Value Objects tienen métodos?**

### **Confusión común:**

> "Si `FavoritePokemonId` tiene métodos (`equals()`, `toString()`), ¿no debería ser una Entity?"

**Respuesta corta:** NO. Los Value Objects SÍ tienen métodos. La diferencia con Entities NO es "tener métodos", sino **cómo se identifican**.

---

### **Diferencias clave:**

| Aspecto | Value Object | Entity |
|---------|-------------|--------|
| **Se identifica por** | Su valor | Su ID único |
| **Comparación** | `value === other.value` | `id.equals(other.id)` |
| **Inmutabilidad** | ✅ Inmutable | Puede mutar |
| **Intercambiable** | ✅ Sí (mismo valor = mismo objeto) | ❌ No (mismo ID = misma entidad) |
| **Tiene métodos** | ✅ SÍ (sobre su valor) | ✅ SÍ (lógica de negocio) |

---

### **En nuestro proyecto:**

#### **FavoritePokemonId → Value Object**

```typescript
class FavoritePokemonId {
  readonly value: string; // "25"
  
  constructor(id: string) {
    if (!this.isValid(id)) throw new Error('Invalid ID');
    this.value = id;
  }
  
  // ✅ Métodos que operan sobre el VALOR
  equals(other: FavoritePokemonId): boolean {
    return this.value === other.value; // Compara por VALOR
  }
  
  toString(): string {
    return this.value;
  }
}

// Dos IDs con el mismo número son INTERCAMBIABLES
const id1 = new FavoritePokemonId('25');
const id2 = new FavoritePokemonId('25');
id1.equals(id2); // true → Son "lo mismo"
```

**¿Por qué es Value Object?**
- Se compara por **valor** (el número "25")
- Es **inmutable** (no puedes cambiar el valor)
- Dos instancias con el mismo valor son **intercambiables**
- Tiene métodos para trabajar con el valor (`equals()`, `toString()`)

---

#### **FavoritePokemon → Entity**

```typescript
class FavoritePokemon {
  readonly id: FavoritePokemonId; // ← Identificador único
  readonly name: string;
  readonly imageUrl: string;
  readonly addedAt: Date;
  
  constructor(id: FavoritePokemonId, name: string, imageUrl: string, addedAt: Date) {
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.addedAt = addedAt;
  }
  
  // ✅ Métodos de LÓGICA DE NEGOCIO
  isRecentlyAdded(): boolean {
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    const diff = now.getTime() - this.addedAt.getTime();
    return diff < dayInMs;
  }
  
  equals(other: FavoritePokemon): boolean {
    return this.id.equals(other.id); // Compara por IDENTIDAD (ID)
  }
}

// Dos favoritos con el mismo ID son LA MISMA ENTIDAD (NO intercambiables)
const fav1 = new FavoritePokemon(id1, 'pikachu', 'url1', date1);
const fav2 = new FavoritePokemon(id2, 'pikachu-shiny', 'url2', date2);

fav1.equals(fav2); // true → Mismo favorito (mismo ID)
// Pero NO son intercambiables (diferentes datos, diferentes instancias)
```

**¿Por qué es Entity?**
- Se compara por **identidad** (su ID)
- Puede tener lógica de negocio compleja (`isRecentlyAdded()`)
- Dos instancias con el mismo ID representan **la misma entidad**
- Tiene métodos de dominio, no solo sobre valores

---

### **Regla de oro:**

**Pregunta:** ¿Dos instancias con los mismos valores son intercambiables?

- **SÍ** → Value Object
  - `FavoritePokemonId('25')` y `FavoritePokemonId('25')` son **lo mismo**
  - Puedo usar cualquiera de los dos indistintamente

- **NO** → Entity
  - Dos `FavoritePokemon` con ID "25" son **la misma entidad**
  - Pero NO son intercambiables (son instancias diferentes en memoria)

---

### **¿Por qué `FavoritePokemonId` tiene métodos?**

**1. `equals()` - Para comparar por valor:**
```typescript
const id1 = new FavoritePokemonId('25');
const id2 = new FavoritePokemonId('25');

// ✅ Más expresivo que comparar strings
id1.equals(id2); // true

// vs

// ❌ Menos expresivo, expone implementación
id1.value === id2.value;
```

**2. `toString()` - Para representación:**
```typescript
const id = new FavoritePokemonId('25');

console.log(`Pokemon ID: ${id}`); // "Pokemon ID: 25"
// Puede cambiar formato sin romper código
```

**3. Validación - Para garantizar invariantes:**
```typescript
// ✅ Validación centralizada en constructor
const id = new FavoritePokemonId('25'); // OK
const invalid = new FavoritePokemonId('abc'); // ❌ Throw error

// Garantía: si existe un FavoritePokemonId, es VÁLIDO
function addToFavorites(id: FavoritePokemonId) {
  // No necesito validar aquí, ya viene validado
}
```

---

### **📚 Para más detalles conceptuales:**

Si necesitas entender mejor la diferencia entre Value Objects y Entities con ejemplos más tangibles (DNI, Email, Persona), consulta: **`VALUE_OBJECTS_VS_ENTITIES_EXPLAINED.md`**

---

## 🔵 PASO 1: DOMAIN LAYER (Reglas de Negocio)

### **1.1 Crear Value Object: FavoritePokemonId**

**Ubicación:** `src/features/pokemon-favorites/domain/value-objects/FavoritePokemonId.ts`

```typescript
/**
 * Value Object que representa el ID de un Pokemon favorito
 * 
 * Responsabilidad:
 * - Validar que el ID es válido
 * - Encapsular la lógica de validación
 * - Inmutable (readonly)
 */
export class FavoritePokemonId {
  public readonly value: string;

  constructor(id: string) {
    // ✅ Validación en el constructor
    if (!id || id.trim().length === 0) {
      throw new Error('Pokemon ID cannot be empty');
    }

    if (!this.isValidId(id)) {
      throw new Error(`Invalid Pokemon ID: ${id}`);
    }

    this.value = id;
  }

  /**
   * Valida que el ID tenga formato correcto
   * En Pokemon, los IDs son números positivos
   */
  private isValidId(id: string): boolean {
    const numericId = parseInt(id, 10);
    return !isNaN(numericId) && numericId > 0;
  }

  /**
   * Comparar dos IDs
   */
  equals(other: FavoritePokemonId): boolean {
    return this.value === other.value;
  }

  /**
   * Representación como string
   */
  toString(): string {
    return this.value;
  }
}
```

**✅ Por qué Value Object:**
- Encapsula validación
- Previene IDs inválidos en toda la app
- Es inmutable (seguridad)
- Es reutilizable

**✅ Tests:**

```typescript
// domain/value-objects/__tests__/FavoritePokemonId.test.ts

it('should create valid ID', () => {
  const id = new FavoritePokemonId('25');
  expect(id.value).toBe('25');
});

it('should throw error for empty ID', () => {
  expect(() => new FavoritePokemonId('')).toThrow('cannot be empty');
});

it('should throw error for invalid ID', () => {
  expect(() => new FavoritePokemonId('abc')).toThrow('Invalid Pokemon ID');
});

it('should compare two IDs correctly', () => {
  const id1 = new FavoritePokemonId('25');
  const id2 = new FavoritePokemonId('25');
  const id3 = new FavoritePokemonId('26');

  expect(id1.equals(id2)).toBe(true);
  expect(id1.equals(id3)).toBe(false);
});
```

---

### **1.2 Crear Entity: FavoritePokemon**

**Ubicación:** `src/features/pokemon-favorites/domain/entities/FavoritePokemon.ts`

```typescript
import { FavoritePokemonId } from '../value-objects/FavoritePokemonId';

/**
 * Entidad que representa un Pokemon favorito
 * 
 * Responsabilidad:
 * - Encapsular datos de un favorito
 * - Proveer métodos de dominio (comportamiento)
 * - Mantener invariantes del negocio
 */
export class FavoritePokemon {
  public readonly id: FavoritePokemonId;
  public readonly name: string;
  public readonly imageUrl: string;
  public readonly addedAt: Date;

  constructor(
    id: FavoritePokemonId,
    name: string,
    imageUrl: string,
    addedAt: Date = new Date()
  ) {
    // ✅ Validaciones de negocio
    if (!name || name.trim().length === 0) {
      throw new Error('Pokemon name cannot be empty');
    }

    if (!imageUrl || !this.isValidUrl(imageUrl)) {
      throw new Error('Invalid image URL');
    }

    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.addedAt = addedAt;
  }

  /**
   * Regla de negocio: ¿Es un favorito reciente?
   * (agregado en las últimas 24 horas)
   */
  isRecentlyAdded(): boolean {
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    const diff = now.getTime() - this.addedAt.getTime();
    return diff < dayInMs;
  }

  /**
   * Regla de negocio: Obtener nombre capitalizado
   */
  getDisplayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }

  /**
   * Serializar para persistencia
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id.value,
      name: this.name,
      imageUrl: this.imageUrl,
      addedAt: this.addedAt.toISOString(),
    };
  }

  /**
   * Deserializar desde JSON
   */
  static fromJSON(data: any): FavoritePokemon {
    return new FavoritePokemon(
      new FavoritePokemonId(data.id),
      data.name,
      data.imageUrl,
      new Date(data.addedAt)
    );
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
```

**✅ Por qué Entity (no interfaz):**
- Encapsula comportamiento (`isRecentlyAdded()`, `getDisplayName()`)
- Valida invariantes del negocio
- Métodos de serialización
- Reutilizable en toda la app

---

### **1.3 Crear Port: FavoritesRepository**

**Ubicación:** `src/features/pokemon-favorites/domain/ports/FavoritesRepository.ts`

```typescript
import { FavoritePokemon } from '../entities/FavoritePokemon';
import { FavoritePokemonId } from '../value-objects/FavoritePokemonId';

/**
 * Port (interfaz) que define el contrato del repositorio
 * 
 * Responsabilidad:
 * - Definir QUÉ operaciones necesita el dominio
 * - NO define CÓMO se implementan (eso es responsabilidad del adaptador)
 * 
 * El dominio NO sabe si los datos vienen de:
 * - localStorage
 * - IndexedDB
 * - API REST
 * - Firebase
 * 
 * Eso lo decide la infrastructure layer.
 */
export interface FavoritesRepository {
  /**
   * Obtener todos los favoritos
   */
  findAll(): Promise<FavoritePokemon[]>;

  /**
   * Obtener un favorito por ID
   */
  findById(id: FavoritePokemonId): Promise<FavoritePokemon | null>;

  /**
   * Agregar un favorito
   */
  add(favorite: FavoritePokemon): Promise<void>;

  /**
   * Eliminar un favorito
   */
  remove(id: FavoritePokemonId): Promise<void>;

  /**
   * Verificar si un Pokemon es favorito
   */
  isFavorite(id: FavoritePokemonId): Promise<boolean>;

  /**
   * Obtener cantidad de favoritos
   */
  count(): Promise<number>;
}
```

**✅ Por qué Port (interfaz):**
- Define el contrato
- Domain no depende de implementación
- Facilita testing (mocks)
- Permite múltiples adaptadores

---

## 🟢 PASO 2: APPLICATION LAYER (Casos de Uso)

### **2.1 Crear Use Case: AddToFavoritesUseCase**

**Ubicación:** `src/features/pokemon-favorites/application/use-cases/add-to-favorites/AddToFavoritesUseCase.ts`

```typescript
import { FavoritePokemon } from '../../../domain/entities/FavoritePokemon';
import { FavoritePokemonId } from '../../../domain/value-objects/FavoritePokemonId';
import { FavoritesRepository } from '../../../domain/ports/FavoritesRepository';

/**
 * DTO para el caso de uso
 */
export interface AddToFavoritesInput {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Caso de uso: Agregar Pokemon a favoritos
 * 
 * Responsabilidad:
 * - Orquestar la lógica de aplicación
 * - Validar que no sea duplicado
 * - Delegar al repositorio
 * - NO contiene lógica de negocio (eso va en Domain)
 * - NO contiene detalles de implementación (eso va en Infrastructure)
 */
export class AddToFavoritesUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  async execute(input: AddToFavoritesInput): Promise<void> {
    // 1. Crear Value Object (con validación)
    const pokemonId = new FavoritePokemonId(input.id);

    // 2. Verificar si ya es favorito
    const alreadyFavorite = await this.repository.isFavorite(pokemonId);
    if (alreadyFavorite) {
      throw new Error(`Pokemon ${input.name} is already in favorites`);
    }

    // 3. Crear entidad (con validación)
    const favorite = new FavoritePokemon(
      pokemonId,
      input.name,
      input.imageUrl
    );

    // 4. Persistir
    await this.repository.add(favorite);
  }
}
```

**✅ Tests:**

```typescript
// add-to-favorites/__tests__/AddToFavoritesUseCase.test.ts

let useCase: AddToFavoritesUseCase;
let mockRepository: jest.Mocked<FavoritesRepository>;

beforeEach(() => {
  mockRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    add: jest.fn(),
    remove: jest.fn(),
    isFavorite: jest.fn(),
    count: jest.fn(),
  };

  useCase = new AddToFavoritesUseCase(mockRepository);
});

it('should add pokemon to favorites', async () => {
  mockRepository.isFavorite.mockResolvedValue(false);

  await useCase.execute({
    id: '25',
    name: 'pikachu',
    imageUrl: 'https://example.com/pikachu.png',
  });

  expect(mockRepository.add).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'pikachu',
    })
  );
});

it('should throw error if already favorite', async () => {
  mockRepository.isFavorite.mockResolvedValue(true);

  await expect(
    useCase.execute({
      id: '25',
      name: 'pikachu',
      imageUrl: 'https://example.com/pikachu.png',
    })
  ).rejects.toThrow('already in favorites');
});

it('should throw error for invalid ID', async () => {
  await expect(
    useCase.execute({
      id: 'invalid',
      name: 'pikachu',
      imageUrl: 'https://example.com/pikachu.png',
    })
  ).rejects.toThrow('Invalid Pokemon ID');
});
```

---

### **2.2 Crear Use Case: RemoveFromFavoritesUseCase**

**Ubicación:** `src/features/pokemon-favorites/application/use-cases/remove-from-favorites/RemoveFromFavoritesUseCase.ts`

```typescript
import { FavoritePokemonId } from '../../../domain/value-objects/FavoritePokemonId';
import { FavoritesRepository } from '../../../domain/ports/FavoritesRepository';

export class RemoveFromFavoritesUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  async execute(pokemonId: string): Promise<void> {
    const id = new FavoritePokemonId(pokemonId);
    
    // Verificar que existe
    const favorite = await this.repository.findById(id);
    if (!favorite) {
      throw new Error('Pokemon is not in favorites');
    }

    await this.repository.remove(id);
  }
}
```

---

### **2.3 Crear ViewModel: FavoritesViewModel**

**Ubicación:** `src/features/pokemon-favorites/application/view-models/FavoritesViewModel.ts`

```typescript
import { FavoritePokemon } from '../../domain/entities/FavoritePokemon';
import { FavoritesRepository } from '../../domain/ports/FavoritesRepository';
import { AddToFavoritesUseCase } from '../use-cases/add-to-favorites/AddToFavoritesUseCase';
import { RemoveFromFavoritesUseCase } from '../use-cases/remove-from-favorites/RemoveFromFavoritesUseCase';

/**
 * ViewModel: Coordina casos de uso para la vista
 * 
 * Responsabilidad:
 * - Exponer métodos simples para la UI
 * - Orquestar múltiples use cases
 * - Transformar datos para la vista (opcional)
 * - NO contiene lógica de React
 */
export class FavoritesViewModel {
  private addUseCase: AddToFavoritesUseCase;
  private removeUseCase: RemoveFromFavoritesUseCase;

  constructor(private readonly repository: FavoritesRepository) {
    this.addUseCase = new AddToFavoritesUseCase(repository);
    this.removeUseCase = new RemoveFromFavoritesUseCase(repository);
  }

  /**
   * Obtener todos los favoritos
   */
  async getFavorites(): Promise<FavoritePokemon[]> {
    return this.repository.findAll();
  }

  /**
   * Agregar a favoritos
   */
  async addToFavorites(id: string, name: string, imageUrl: string): Promise<void> {
    await this.addUseCase.execute({ id, name, imageUrl });
  }

  /**
   * Eliminar de favoritos
   */
  async removeFromFavorites(id: string): Promise<void> {
    await this.removeUseCase.execute(id);
  }

  /**
   * Verificar si es favorito
   */
  async isFavorite(id: string): Promise<boolean> {
    const pokemonId = new FavoritePokemonId(id);
    return this.repository.isFavorite(pokemonId);
  }

  /**
   * Obtener count de favoritos
   */
  async getFavoritesCount(): Promise<number> {
    return this.repository.count();
  }
}
```

---

## 🟡 PASO 3: INFRASTRUCTURE LAYER (Adaptadores)

### **3.1 Crear Adaptador: LocalStorageFavoritesRepository**

**Ubicación:** `src/features/pokemon-favorites/infrastructure/storage/LocalStorageFavoritesRepository.ts`

```typescript
import { FavoritePokemon } from '../../domain/entities/FavoritePokemon';
import { FavoritePokemonId } from '../../domain/value-objects/FavoritePokemonId';
import { FavoritesRepository } from '../../domain/ports/FavoritesRepository';

/**
 * Adaptador que implementa FavoritesRepository usando localStorage
 * 
 * Responsabilidad:
 * - Implementar el port FavoritesRepository
 * - Manejar detalles técnicos de localStorage
 * - Serializar/deserializar datos
 * - NO contiene lógica de negocio
 */
export class LocalStorageFavoritesRepository implements FavoritesRepository {
  private readonly STORAGE_KEY = 'pokemon-favorites';

  async findAll(): Promise<FavoritePokemon[]> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      return parsed.map((item: any) => FavoritePokemon.fromJSON(item));
    } catch (error) {
      console.error('Error loading favorites:', error);
      return [];
    }
  }

  async findById(id: FavoritePokemonId): Promise<FavoritePokemon | null> {
    const all = await this.findAll();
    return all.find(fav => fav.id.equals(id)) || null;
  }

  async add(favorite: FavoritePokemon): Promise<void> {
    const all = await this.findAll();
    all.push(favorite);
    this.save(all);
  }

  async remove(id: FavoritePokemonId): Promise<void> {
    const all = await this.findAll();
    const filtered = all.filter(fav => !fav.id.equals(id));
    this.save(filtered);
  }

  async isFavorite(id: FavoritePokemonId): Promise<boolean> {
    const favorite = await this.findById(id);
    return favorite !== null;
  }

  async count(): Promise<number> {
    const all = await this.findAll();
    return all.length;
  }

  private save(favorites: FavoritePokemon[]): void {
    try {
      const serialized = favorites.map(fav => fav.toJSON());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw new Error('Failed to save favorites');
    }
  }
}
```

**✅ Por qué en Infrastructure:**
- Es un detalle de implementación
- Usa localStorage (tecnología específica)
- Podría cambiarse por IndexedDB sin afectar domain/application

---

### **3.2 Crear Hook React: useFavorites**

**Ubicación:** `src/features/pokemon-favorites/infrastructure/react/hooks/useFavorites.ts`

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { FavoritePokemon } from '../../../domain/entities/FavoritePokemon';
import { FavoritesViewModel } from '../../../application/view-models/FavoritesViewModel';
import { LocalStorageFavoritesRepository } from '../../storage/LocalStorageFavoritesRepository';

interface UseFavoritesResult {
  favorites: FavoritePokemon[];
  isLoading: boolean;
  isError: boolean;
  addToFavorites: (id: string, name: string, imageUrl: string) => Promise<void>;
  removeFromFavorites: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
  favoritesCount: number;
}

/**
 * Hook React para manejar favoritos
 * 
 * Responsabilidad:
 * - Conectar React con el ViewModel
 * - Manejar estado de React (loading, error)
 * - Exponer funciones simples para componentes
 * - NO contiene lógica de negocio
 */
export function useFavorites(): UseFavoritesResult {
  const [favorites, setFavorites] = useState<FavoritePokemon[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Setup infrastructure
  const repository = useMemo(() => new LocalStorageFavoritesRepository(), []);
  const viewModel = useMemo(() => new FavoritesViewModel(repository), [repository]);

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const data = await viewModel.getFavorites();
        setFavorites(data);
      } catch (error) {
        console.error('Error loading favorites:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [viewModel]);

  // Add to favorites
  const addToFavorites = useCallback(
    async (id: string, name: string, imageUrl: string) => {
      try {
        await viewModel.addToFavorites(id, name, imageUrl);
        const updated = await viewModel.getFavorites();
        setFavorites(updated);
      } catch (error) {
        console.error('Error adding favorite:', error);
        throw error;
      }
    },
    [viewModel]
  );

  // Remove from favorites
  const removeFromFavorites = useCallback(
    async (id: string) => {
      try {
        await viewModel.removeFromFavorites(id);
        const updated = await viewModel.getFavorites();
        setFavorites(updated);
      } catch (error) {
        console.error('Error removing favorite:', error);
        throw error;
      }
    },
    [viewModel]
  );

  // Check if favorite (derived state)
  const isFavorite = useCallback(
    (id: string) => {
      return favorites.some(fav => fav.id.value === id);
    },
    [favorites]
  );

  return {
    favorites,
    isLoading,
    isError,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    favoritesCount: favorites.length,
  };
}
```

---

## 🔴 PASO 4: UI LAYER (Presentación)

### **4.1 Crear Componente: FavoriteButton**

**Ubicación:** `src/features/pokemon-favorites/ui/FavoriteButton.tsx`

```typescript
import { useState } from 'react';

interface FavoriteButtonProps {
  pokemonId: string;
  pokemonName: string;
  pokemonImageUrl: string;
  isFavorite: boolean;
  onToggle: (id: string, name: string, imageUrl: string) => Promise<void>;
}

/**
 * Componente "humble" que solo renderiza
 * 
 * Responsabilidad:
 * - Renderizar botón de favorito
 * - Manejar click (delega al hook)
 * - NO contiene lógica de negocio
 */
export const FavoriteButton = ({
  pokemonId,
  pokemonName,
  pokemonImageUrl,
  isFavorite,
  onToggle,
}: FavoriteButtonProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsProcessing(true);
    try {
      await onToggle(pokemonId, pokemonName, pokemonImageUrl);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Failed to update favorites');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isProcessing}
      className={`
        p-2 rounded-full transition-colors
        ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isProcessing ? (
        <span>⏳</span>
      ) : isFavorite ? (
        <span>❤️</span>
      ) : (
        <span>🤍</span>
      )}
    </button>
  );
};
```

---

### **4.2 Integrar en PokemonListItem**

**Ubicación:** `src/features/pokemon-list/ui/PokemonListItem.tsx`

```typescript
import { memo } from "react";
import { Link } from "react-router-dom";
import { FavoriteButton } from "../../pokemon-favorites/ui/FavoriteButton";
import { useFavorites } from "../../pokemon-favorites/infrastructure/react/hooks/useFavorites";

interface PokemonListItemProps {
  name: string;
  height: number;
  imageUrl: string;
}

const PokemonListItem = memo(({ name, height, imageUrl }: PokemonListItemProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  // Extraer ID del imageUrl (para ejemplo)
  const pokemonId = imageUrl.split('/').slice(-1)[0].replace('.png', '');
  const isFav = isFavorite(pokemonId);

  const handleToggleFavorite = async (id: string, name: string, imgUrl: string) => {
    if (isFav) {
      await removeFromFavorites(id);
    } else {
      await addToFavorites(id, name, imgUrl);
    }
  };

  return (
    <Link
      to={`/${name}`}
      className="relative block p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
    >
      {/* Botón de favorito */}
      <div className="absolute top-2 right-2">
        <FavoriteButton
          pokemonId={pokemonId}
          pokemonName={name}
          pokemonImageUrl={imageUrl}
          isFavorite={isFav}
          onToggle={handleToggleFavorite}
        />
      </div>

      <img src={imageUrl} alt={name} className="w-full h-32 object-contain" />
      <h3 className="text-center mt-2 font-semibold capitalize">{name}</h3>
      <p className="text-center text-sm text-gray-600">Height: {height}</p>
    </Link>
  );
});

export default PokemonListItem;
```

---

### **4.3 Crear Página de Favoritos**

**Ubicación:** `src/features/pokemon-favorites/ui/FavoritesPage.tsx`

```typescript
import { useFavorites } from '../infrastructure/react/hooks/useFavorites';
import { FavoriteButton } from './FavoriteButton';

export const FavoritesPage = () => {
  const {
    favorites,
    isLoading,
    isError,
    removeFromFavorites,
    isFavorite,
  } = useFavorites();

  if (isLoading) {
    return (
      <div className="text-center my-8">
        <h2>Loading favorites...</h2>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center my-8 text-red-500">
        <h2>Error loading favorites</h2>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="text-center my-8">
        <h2>No favorites yet</h2>
        <p className="text-gray-600 mt-2">
          Start adding Pokemon to your favorites!
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Favorite Pokemon</h1>
      <p className="text-gray-600 mb-8">
        You have {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((favorite) => (
          <div
            key={favorite.id.value}
            className="relative p-4 bg-white rounded-lg shadow"
          >
            <div className="absolute top-2 right-2">
              <FavoriteButton
                pokemonId={favorite.id.value}
                pokemonName={favorite.name}
                pokemonImageUrl={favorite.imageUrl}
                isFavorite={true}
                onToggle={() => removeFromFavorites(favorite.id.value)}
              />
            </div>

            <img
              src={favorite.imageUrl}
              alt={favorite.name}
              className="w-full h-32 object-contain"
            />
            <h3 className="text-center mt-2 font-semibold">
              {favorite.getDisplayName()}
            </h3>
            {favorite.isRecentlyAdded() && (
              <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Recently added
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 📊 Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ USER clicks "Add to Favorites" button                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ UI LAYER - FavoriteButton.tsx                               │
│ handleClick() → calls onToggle()                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - useFavorites hook                          │
│ addToFavorites() → calls viewModel.addToFavorites()         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION - FavoritesViewModel                            │
│ addToFavorites() → calls addUseCase.execute()               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ APPLICATION - AddToFavoritesUseCase                         │
│ 1. Create FavoritePokemonId (validates)                     │
│ 2. Check if already favorite (repository.isFavorite())      │
│ 3. Create FavoritePokemon entity (validates)                │
│ 4. Save (repository.add())                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - LocalStorageFavoritesRepository            │
│ add() → saves to localStorage                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ INFRASTRUCTURE - useFavorites hook                          │
│ Refreshes state → setFavorites(updated)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ UI LAYER - Component re-renders with updated state          │
│ Button shows filled heart ❤️                                │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Desarrollo

### **Domain Layer:**
- [ ] Crear Value Objects con validación
- [ ] Crear Entities con comportamiento
- [ ] Crear Ports (interfaces de repositorios)
- [ ] Tests de Value Objects
- [ ] Tests de Entities
- [ ] NO importar React, HTTP, Redux

### **Application Layer:**
- [ ] Crear Use Cases con lógica de aplicación
- [ ] Crear ViewModels que orquestan use cases
- [ ] Tests de Use Cases con mocks
- [ ] Tests de ViewModels
- [ ] NO importar React, HTTP, Redux

### **Infrastructure Layer:**
- [ ] Crear adaptadores (Repository implementations)
- [ ] Crear hooks de React
- [ ] Crear Redux slices (si es necesario)
- [ ] Tests de adaptadores
- [ ] Tests de hooks (con @testing-library/react)

### **UI Layer:**
- [ ] Crear componentes "humble"
- [ ] Integrar hooks
- [ ] Tests de componentes (con @testing-library/react)
- [ ] NO poner lógica de negocio en componentes

---

## 🎯 Preguntas Frecuentes

### **1. ¿Cuándo crear un Value Object vs solo usar string?**

**Usa Value Object si:**
- Tiene validación (email, ID, phone)
- Tiene comportamiento (comparación, formatting)
- Es un concepto del dominio (no solo un dato)

**Ejemplo:** `FavoritePokemonId` valida que sea un número positivo.

---

### **2. ¿Cuándo crear una Entity vs una interfaz?**

**Usa Entity (clase) si:**
- Tiene comportamiento (`isRecentlyAdded()`, `getDisplayName()`)
- Necesita validación en constructor
- Necesita métodos de serialización

**Ejemplo:** `FavoritePokemon` tiene métodos como `isRecentlyAdded()`.

---

### **3. ¿Cuándo crear un Use Case?**

**Siempre** que tengas una operación de negocio:
- Agregar favorito
- Eliminar favorito
- Hacer login
- Enviar formulario

**Beneficios:**
- Testeable sin UI
- Reutilizable
- Clara responsabilidad

---

### **4. ¿Cuándo usar Redux vs hook local?**

**Usa Redux si:**
- Estado compartido entre múltiples features
- Necesitas persistencia
- Estado cambia frecuentemente
- Muchos componentes lo consumen

**Usa hook local si:**
- Estado local a una feature
- No se comparte
- Cambios poco frecuentes

**Ejemplo:** Favoritos podría usar Redux si quieres un contador en el header.

---

### **5. ¿Puedo tener múltiples adaptadores?**

**¡Sí!** Esa es la ventaja de hexagonal:

```typescript
// Adaptador 1: localStorage
class LocalStorageFavoritesRepository implements FavoritesRepository {
  // Implementación con localStorage
}

// Adaptador 2: API REST
class ApiFavoritesRepository implements FavoritesRepository {
  // Implementación con fetch
}

// Adaptador 3: IndexedDB
class IndexedDBFavoritesRepository implements FavoritesRepository {
  // Implementación con IndexedDB
}

// En el hook, decides cuál usar
const repository = useMemo(() => {
  if (useOfflineMode) {
    return new LocalStorageFavoritesRepository();
  }
  return new ApiFavoritesRepository();
}, [useOfflineMode]);
```

---

## 🚀 Resumen

**Flujo de desarrollo:**
1. **Domain:** Definir entidades, value objects, ports
2. **Application:** Crear use cases, viewModels
3. **Infrastructure:** Implementar adaptadores
4. **UI:** Crear componentes "humble"

**Principios clave:**
- ✅ Dependencies hacia adentro
- ✅ Domain NO conoce frameworks
- ✅ Use Cases orquestan, NO contienen lógica de negocio
- ✅ Adaptadores implementan ports
- ✅ UI solo renderiza

**Ventajas:**
- ✅ Testeable en cada capa
- ✅ Fácil de cambiar implementación
- ✅ Lógica de negocio protegida
- ✅ Agnóstico de frameworks (en domain/application)

---

**Autor:** Claude Sonnet 4.5  
**Fecha:** 2025-10-24  
**Contexto:** Guía general para desarrollo de features con Arquitectura Hexagonal  
**Basado en:** Refactor pokemon-list feature
