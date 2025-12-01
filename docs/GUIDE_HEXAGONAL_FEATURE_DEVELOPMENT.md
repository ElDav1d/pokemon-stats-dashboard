# Guide: Feature Development with Hexagonal Architecture

## 📋 Objective

This guide teaches you how to develop **any new feature** in the project following the principles of **Hexagonal Architecture** and **Clean Architecture**, using the `pokemon-list` feature as a reference.

---

## 🎯 Fundamental Principles

### **1. Dependency Rule (The Golden Rule)**

```
UI → Infrastructure → Application → Domain
```

**Golden rule:** Dependencies ALWAYS point inward.

```typescript
// ✅ CORRECT
Domain/Entity.ts  // Imports nothing
Application/UseCase.ts  // Imports Domain
Infrastructure/Repository.ts  // Imports Domain
UI/Component.tsx  // Imports Infrastructure

// ❌ INCORRECT
Domain/Entity.ts  // Imports fetch, React, Redux ← NO!
```

---

### **2. Separation of Concerns**

Each layer has ONE clear responsibility:

| Layer | Responsibility | Contains | Does NOT contain |
|-------|----------------|----------|------------------|
| **Domain** | Pure business rules | Entities, Value Objects, Ports | React, HTTP, Redux |
| **Application** | Orchestrate domain | Use Cases, ViewModels | React, HTTP, Redux |
| **Infrastructure** | Technical adapters | HTTP, React hooks, Redux | Business logic |
| **UI** | Presentation | React Components | Business logic, HTTP |

---

### **3. Ports & Adapters**

```
┌─────────────────────────────────────────┐
│ DOMAIN defines PORTS (interfaces)       │
│ "I need a repository that gives me X"   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ INFRASTRUCTURE implements ADAPTERS      │
│ "I implement that port with HTTP"       │
└─────────────────────────────────────────┘
```

**Example:**
```typescript
// Domain defines the PORT
export interface PokemonRepository {
  findAllByType(type: PokemonType): Promise<PokemonListItem[]>;
}

// Infrastructure implements the ADAPTER
export class HttpPokemonRepository implements PokemonRepository {
  async findAllByType(type: PokemonType): Promise<PokemonListItem[]> {
    // Implementation with HTTP
  }
}
```

---

## 📂 Folder Structure by Feature

```
src/
├── features/
│   └── [feature-name]/
│       ├── domain/                    # 🔵 LAYER 1: Business rules
│       │   ├── entities/              # Rich objects with behavior
│       │   ├── value-objects/         # Immutable objects with validation
│       │   ├── ports/                 # Interfaces (contracts)
│       │   └── constants/             # Domain constants
│       │
│       ├── application/               # 🟢 LAYER 2: Use cases
│       │   ├── use-cases/             # Application logic
│       │   │   └── [use-case-name]/
│       │   │       ├── [UseCase].ts
│       │   │       └── [UseCase].test.ts
│       │   └── view-models/           # UI coordinators
│       │       └── [ViewModel].ts
│       │
│       ├── infrastructure/            # 🟡 LAYER 3: Adapters
│       │   ├── http/                  # HTTP adapter
│       │   │   └── Http[Name]Repository.ts
│       │   ├── react/                 # React adapter
│       │   │   └── hooks/
│       │   │       └── use[Name].ts
│       │   └── redux/                 # Redux adapter (optional)
│       │       ├── slices/
│       │       └── selectors/
│       │
│       └── ui/                        # 🔴 LAYER 4: Presentation
│           ├── [FeatureName].tsx      # Main component
│           └── [ComponentName].tsx    # Subcomponents
│
└── infrastructure/                    # 🟡 SHARED (entire app)
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

## 🚀 Step by Step: Developing a New Feature

Let's develop a hypothetical feature: **"Pokemon Favorites"** (marking Pokemon as favorites).

---

---

## ❓ **Important Clarification: Why do Value Objects have methods?**

### **Common confusion:**

> "If `FavoritePokemonId` has methods (`equals()`, `toString()`), shouldn't it be an Entity?"

**Short answer:** NO. Value Objects DO have methods. The difference with Entities is NOT "having methods", but **how they are identified**.

---

### **Key differences:**

| Aspect | Value Object | Entity |
|--------|-------------|--------|
| **Identified by** | Its value | Its unique ID |
| **Comparison** | `value === other.value` | `id.equals(other.id)` |
| **Immutability** | ✅ Immutable | Can mutate |
| **Interchangeable** | ✅ Yes (same value = same object) | ❌ No (same ID = same entity) |
| **Has methods** | ✅ YES (about its value) | ✅ YES (business logic) |

---

### **In our project:**

#### **FavoritePokemonId → Value Object**

```typescript
class FavoritePokemonId {
  readonly value: string; // "25"

  constructor(id: string) {
    if (!this.isValid(id)) throw new Error('Invalid ID');
    this.value = id;
  }

  // ✅ Methods that operate on the VALUE
  equals(other: FavoritePokemonId): boolean {
    return this.value === other.value; // Compares by VALUE
  }

  toString(): string {
    return this.value;
  }
}

// Two IDs with the same number are INTERCHANGEABLE
const id1 = new FavoritePokemonId('25');
const id2 = new FavoritePokemonId('25');
id1.equals(id2); // true → They are "the same"
```

**Why is it a Value Object?**
- Compared by **value** (the number "25")
- Is **immutable** (you can't change the value)
- Two instances with the same value are **interchangeable**
- Has methods to work with the value (`equals()`, `toString()`)

---

#### **FavoritePokemon → Entity**

```typescript
class FavoritePokemon {
  readonly id: FavoritePokemonId; // ← Unique identifier
  readonly name: string;
  readonly imageUrl: string;
  readonly addedAt: Date;

  constructor(id: FavoritePokemonId, name: string, imageUrl: string, addedAt: Date) {
    this.id = id;
    this.name = name;
    this.imageUrl = imageUrl;
    this.addedAt = addedAt;
  }

  // ✅ Methods of BUSINESS LOGIC
  isRecentlyAdded(): boolean {
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    const diff = now.getTime() - this.addedAt.getTime();
    return diff < dayInMs;
  }

  equals(other: FavoritePokemon): boolean {
    return this.id.equals(other.id); // Compares by IDENTITY (ID)
  }
}

// Two favorites with the same ID are THE SAME ENTITY (NOT interchangeable)
const fav1 = new FavoritePokemon(id1, 'pikachu', 'url1', date1);
const fav2 = new FavoritePokemon(id2, 'pikachu-shiny', 'url2', date2);

fav1.equals(fav2); // true → Same favorite (same ID)
// But they are NOT interchangeable (different data, different instances)
```

**Why is it an Entity?**
- Compared by **identity** (its ID)
- Can have complex business logic (`isRecentlyAdded()`)
- Two instances with the same ID represent **the same entity**
- Has domain methods, not just about values

---

### **Golden rule:**

**Question:** Are two instances with the same values interchangeable?

- **YES** → Value Object
  - `FavoritePokemonId('25')` and `FavoritePokemonId('25')` are **the same**
  - I can use any of them interchangeably

- **NO** → Entity
  - Two `FavoritePokemon` with ID "25" are **the same entity**
  - But they are NOT interchangeable (different instances in memory)

---

### **Why does `FavoritePokemonId` have methods?**

**1. `equals()` - To compare by value:**
```typescript
const id1 = new FavoritePokemonId('25');
const id2 = new FavoritePokemonId('25');

// ✅ More expressive than comparing strings
id1.equals(id2); // true

// vs

// ❌ Less expressive, exposes implementation
id1.value === id2.value;
```

**2. `toString()` - For representation:**
```typescript
const id = new FavoritePokemonId('25');

console.log(`Pokemon ID: ${id}`); // "Pokemon ID: 25"
// Can change format without breaking code
```

**3. Validation - To guarantee invariants:**
```typescript
// ✅ Centralized validation in constructor
const id = new FavoritePokemonId('25'); // OK
const invalid = new FavoritePokemonId('abc'); // ❌ Throw error

// Guarantee: if a FavoritePokemonId exists, it's VALID
function addToFavorites(id: FavoritePokemonId) {
  // No need to validate here, it already comes validated
}
```

---

### **📚 For more conceptual details:**

If you need to better understand the difference between Value Objects and Entities with more tangible examples (ID, Email, Person), check: **`VALUE_OBJECTS_VS_ENTITIES_EXPLAINED.md`**

---

## 🔵 STEP 1: DOMAIN LAYER (Business Rules)

### **1.1 Create Value Object: FavoritePokemonId**

**Location:** `src/features/pokemon-favorites/domain/value-objects/FavoritePokemonId.ts`

```typescript
/**
 * Value Object that represents a favorite Pokemon's ID
 *
 * Responsibility:
 * - Validate that the ID is valid
 * - Encapsulate validation logic
 * - Immutable (readonly)
 */
export class FavoritePokemonId {
  public readonly value: string;

  constructor(id: string) {
    // ✅ Validation in constructor
    if (!id || id.trim().length === 0) {
      throw new Error('Pokemon ID cannot be empty');
    }

    if (!this.isValidId(id)) {
      throw new Error(`Invalid Pokemon ID: ${id}`);
    }

    this.value = id;
  }

  /**
   * Validates that the ID has correct format
   * In Pokemon, IDs are positive numbers
   */
  private isValidId(id: string): boolean {
    const numericId = parseInt(id, 10);
    return !isNaN(numericId) && numericId > 0;
  }

  /**
   * Compare two IDs
   */
  equals(other: FavoritePokemonId): boolean {
    return this.value === other.value;
  }

  /**
   * Representation as string
   */
  toString(): string {
    return this.value;
  }
}
```

**✅ Why Value Object:**
- Encapsulates validation
- Prevents invalid IDs throughout the app
- Is immutable (security)
- Is reusable

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

### **1.2 Create Entity: FavoritePokemon**

**Location:** `src/features/pokemon-favorites/domain/entities/FavoritePokemon.ts`

```typescript
import { FavoritePokemonId } from '../value-objects/FavoritePokemonId';

/**
 * Entity that represents a favorite Pokemon
 *
 * Responsibility:
 * - Encapsulate favorite Pokemon data
 * - Provide domain methods (behavior)
 * - Maintain business invariants
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
    // ✅ Business validations
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
   * Business rule: Is it a recent favorite?
   * (added in the last 24 hours)
   */
  isRecentlyAdded(): boolean {
    const now = new Date();
    const dayInMs = 24 * 60 * 60 * 1000;
    const diff = now.getTime() - this.addedAt.getTime();
    return diff < dayInMs;
  }

  /**
   * Business rule: Get capitalized name
   */
  getDisplayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }

  /**
   * Serialize for persistence
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
   * Deserialize from JSON
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

**✅ Why Entity (not interface):**
- Encapsulates behavior (`isRecentlyAdded()`, `getDisplayName()`)
- Validates business invariants
- Serialization methods
- Reusable throughout the app

---

### **1.3 Create Port: FavoritesRepository**

**Location:** `src/features/pokemon-favorites/domain/ports/FavoritesRepository.ts`

```typescript
import { FavoritePokemon } from '../entities/FavoritePokemon';
import { FavoritePokemonId } from '../value-objects/FavoritePokemonId';

/**
 * Port (interface) that defines the repository contract
 *
 * Responsibility:
 * - Define WHAT operations the domain needs
 * - Does NOT define HOW they are implemented (that's the adapter's job)
 *
 * The domain does NOT know if data comes from:
 * - localStorage
 * - IndexedDB
 * - REST API
 * - Firebase
 *
 * That's decided by the infrastructure layer.
 */
export interface FavoritesRepository {
  /**
   * Get all favorites
   */
  findAll(): Promise<FavoritePokemon[]>;

  /**
   * Get a favorite by ID
   */
  findById(id: FavoritePokemonId): Promise<FavoritePokemon | null>;

  /**
   * Add a favorite
   */
  add(favorite: FavoritePokemon): Promise<void>;

  /**
   * Remove a favorite
   */
  remove(id: FavoritePokemonId): Promise<void>;

  /**
   * Check if a Pokemon is favorite
   */
  isFavorite(id: FavoritePokemonId): Promise<boolean>;

  /**
   * Get count of favorites
   */
  count(): Promise<number>;
}
```

**✅ Why Port (interface):**
- Defines the contract
- Domain doesn't depend on implementation
- Facilitates testing (mocks)
- Allows multiple adapters

---

## 🟢 STEP 2: APPLICATION LAYER (Use Cases)

### **2.1 Create Use Case: AddToFavoritesUseCase**

**Location:** `src/features/pokemon-favorites/application/use-cases/add-to-favorites/AddToFavoritesUseCase.ts`

```typescript
import { FavoritePokemon } from '../../../domain/entities/FavoritePokemon';
import { FavoritePokemonId } from '../../../domain/value-objects/FavoritePokemonId';
import { FavoritesRepository } from '../../../domain/ports/FavoritesRepository';

/**
 * DTO for the use case
 */
export interface AddToFavoritesInput {
  id: string;
  name: string;
  imageUrl: string;
}

/**
 * Use case: Add Pokemon to favorites
 *
 * Responsibility:
 * - Orchestrate application logic
 * - Validate that it's not a duplicate
 * - Delegate to repository
 * - Does NOT contain business logic (that goes in Domain)
 * - Does NOT contain implementation details (that goes in Infrastructure)
 */
export class AddToFavoritesUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  async execute(input: AddToFavoritesInput): Promise<void> {
    // 1. Create Value Object (with validation)
    const pokemonId = new FavoritePokemonId(input.id);

    // 2. Check if already favorite
    const alreadyFavorite = await this.repository.isFavorite(pokemonId);
    if (alreadyFavorite) {
      throw new Error(`Pokemon ${input.name} is already in favorites`);
    }

    // 3. Create entity (with validation)
    const favorite = new FavoritePokemon(
      pokemonId,
      input.name,
      input.imageUrl
    );

    // 4. Persist
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

### **2.2 Create Use Case: RemoveFromFavoritesUseCase**

**Location:** `src/features/pokemon-favorites/application/use-cases/remove-from-favorites/RemoveFromFavoritesUseCase.ts`

```typescript
import { FavoritePokemonId } from '../../../domain/value-objects/FavoritePokemonId';
import { FavoritesRepository } from '../../../domain/ports/FavoritesRepository';

export class RemoveFromFavoritesUseCase {
  constructor(private readonly repository: FavoritesRepository) {}

  async execute(pokemonId: string): Promise<void> {
    const id = new FavoritePokemonId(pokemonId);

    // Verify it exists
    const favorite = await this.repository.findById(id);
    if (!favorite) {
      throw new Error('Pokemon is not in favorites');
    }

    await this.repository.remove(id);
  }
}
```

---

### **2.3 Create ViewModel: FavoritesViewModel**

**Location:** `src/features/pokemon-favorites/application/view-models/FavoritesViewModel.ts`

```typescript
import { FavoritePokemon } from '../../domain/entities/FavoritePokemon';
import { FavoritesRepository } from '../../domain/ports/FavoritesRepository';
import { AddToFavoritesUseCase } from '../use-cases/add-to-favorites/AddToFavoritesUseCase';
import { RemoveFromFavoritesUseCase } from '../use-cases/remove-from-favorites/RemoveFromFavoritesUseCase';

/**
 * ViewModel: Coordinates use cases for the view
 *
 * Responsibility:
 * - Expose simple methods for the UI
 * - Orchestrate multiple use cases
 * - Transform data for the view (optional)
 * - Does NOT contain React logic
 */
export class FavoritesViewModel {
  private addUseCase: AddToFavoritesUseCase;
  private removeUseCase: RemoveFromFavoritesUseCase;

  constructor(private readonly repository: FavoritesRepository) {
    this.addUseCase = new AddToFavoritesUseCase(repository);
    this.removeUseCase = new RemoveFromFavoritesUseCase(repository);
  }

  /**
   * Get all favorites
   */
  async getFavorites(): Promise<FavoritePokemon[]> {
    return this.repository.findAll();
  }

  /**
   * Add to favorites
   */
  async addToFavorites(id: string, name: string, imageUrl: string): Promise<void> {
    await this.addUseCase.execute({ id, name, imageUrl });
  }

  /**
   * Remove from favorites
   */
  async removeFromFavorites(id: string): Promise<void> {
    await this.removeUseCase.execute(id);
  }

  /**
   * Check if it's favorite
   */
  async isFavorite(id: string): Promise<boolean> {
    const pokemonId = new FavoritePokemonId(id);
    return this.repository.isFavorite(pokemonId);
  }

  /**
   * Get count of favorites
   */
  async getFavoritesCount(): Promise<number> {
    return this.repository.count();
  }
}
```

---

## 🟡 STEP 3: INFRASTRUCTURE LAYER (Adapters)

### **3.1 Create Adapter: LocalStorageFavoritesRepository**

**Location:** `src/features/pokemon-favorites/infrastructure/storage/LocalStorageFavoritesRepository.ts`

```typescript
import { FavoritePokemon } from '../../domain/entities/FavoritePokemon';
import { FavoritePokemonId } from '../../domain/value-objects/FavoritePokemonId';
import { FavoritesRepository } from '../../domain/ports/FavoritesRepository';

/**
 * Adapter that implements FavoritesRepository using localStorage
 *
 * Responsibility:
 * - Implement the FavoritesRepository port
 * - Handle technical details of localStorage
 * - Serialize/deserialize data
 * - Does NOT contain business logic
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

**✅ Why in Infrastructure:**
- It's an implementation detail
- Uses localStorage (specific technology)
- Could be replaced with IndexedDB without affecting domain/application

---

### **3.2 Create React Hook: useFavorites**

**Location:** `src/features/pokemon-favorites/infrastructure/react/hooks/useFavorites.ts`

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
 * React hook for handling favorites
 *
 * Responsibility:
 * - Connect React with the ViewModel
 * - Handle React state (loading, error)
 * - Expose simple functions for components
 * - Does NOT contain business logic
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

## 🔴 STEP 4: UI LAYER (Presentation)

### **4.1 Create Component: FavoriteButton**

**Location:** `src/features/pokemon-favorites/ui/FavoriteButton.tsx`

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
 * "Humble" component that only renders
 *
 * Responsibility:
 * - Render favorite button
 * - Handle click (delegates to hook)
 * - Does NOT contain business logic
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

### **4.2 Integrate into PokemonListItem**

**Location:** `src/features/pokemon-list/ui/PokemonListItem.tsx`

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

  // Extract ID from imageUrl (for example)
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
      {/* Favorite button */}
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

### **4.3 Create Favorites Page**

**Location:** `src/features/pokemon-favorites/ui/FavoritesPage.tsx`

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

## 📊 Complete Flow Diagram

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

## ✅ Development Checklist

### **Domain Layer:**
- [ ] Create Value Objects with validation
- [ ] Create Entities with behavior
- [ ] Create Ports (repository interfaces)
- [ ] Tests for Value Objects
- [ ] Tests for Entities
- [ ] Do NOT import React, HTTP, Redux

### **Application Layer:**
- [ ] Create Use Cases with application logic
- [ ] Create ViewModels that orchestrate use cases
- [ ] Tests for Use Cases with mocks
- [ ] Tests for ViewModels
- [ ] Do NOT import React, HTTP, Redux

### **Infrastructure Layer:**
- [ ] Create adapters (Repository implementations)
- [ ] Create React hooks
- [ ] Create Redux slices (if needed)
- [ ] Tests for adapters
- [ ] Tests for hooks (with @testing-library/react)

### **UI Layer:**
- [ ] Create "humble" components
- [ ] Integrate hooks
- [ ] Tests for components (with @testing-library/react)
- [ ] Do NOT put business logic in components

---

## 🎯 Frequently Asked Questions

### **1. When to create a Value Object vs just use string?**

**Use Value Object if:**
- It has validation (email, ID, phone)
- It has behavior (comparison, formatting)
- It's a domain concept (not just data)

**Example:** `FavoritePokemonId` validates that it's a positive number.

---

### **2. When to create an Entity vs an interface?**

**Use Entity (class) if:**
- It has behavior (`isRecentlyAdded()`, `getDisplayName()`)
- It needs validation in constructor
- It needs serialization methods

**Example:** `FavoritePokemon` has methods like `isRecentlyAdded()`.

---

### **3. When to create a Use Case?**

**Always** when you have a business operation:
- Add favorite
- Remove favorite
- Login
- Submit form

**Benefits:**
- Testable without UI
- Reusable
- Clear responsibility

---

### **4. When to use Redux vs local hook?**

**Use Redux if:**
- State is shared between multiple features
- You need persistence
- State changes frequently
- Many components consume it

**Use local hook if:**
- State is local to a feature
- It's not shared
- Changes are infrequent

**Example:** Favorites could use Redux if you want a counter in the header.

---

### **5. Can I have multiple adapters?**

**Yes!** That's the advantage of hexagonal:

```typescript
// Adapter 1: localStorage
class LocalStorageFavoritesRepository implements FavoritesRepository {
  // Implementation with localStorage
}

// Adapter 2: REST API
class ApiFavoritesRepository implements FavoritesRepository {
  // Implementation with fetch
}

// Adapter 3: IndexedDB
class IndexedDBFavoritesRepository implements FavoritesRepository {
  // Implementation with IndexedDB
}

// In the hook, you decide which to use
const repository = useMemo(() => {
  if (useOfflineMode) {
    return new LocalStorageFavoritesRepository();
  }
  return new ApiFavoritesRepository();
}, [useOfflineMode]);
```

---

## 🚀 Summary

**Development flow:**
1. **Domain:** Define entities, value objects, ports
2. **Application:** Create use cases, ViewModels
3. **Infrastructure:** Implement adapters
4. **UI:** Create "humble" components

**Key principles:**
- ✅ Dependencies point inward
- ✅ Domain does NOT know about frameworks
- ✅ Use Cases orchestrate, do NOT contain business logic
- ✅ Adapters implement ports
- ✅ UI only renders

**Advantages:**
- ✅ Testable at each layer
- ✅ Easy to change implementation
- ✅ Business logic is protected
- ✅ Framework-agnostic (in domain/application)

---

**Author:** Claude Sonnet 4.5
**Date:** 2025-10-24
**Context:** General guide for feature development with Hexagonal Architecture
**Based on:** Refactor pokemon-list feature
