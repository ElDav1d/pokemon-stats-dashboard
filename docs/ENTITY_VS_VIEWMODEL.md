# Entity vs ViewModel: Complementary Responsibilities

## 📋 TL;DR

**Entity (Domain):** "What IS this concept?" → Universal business rules
**ViewModel (Application):** "How do I PRESENT this?" → Preparation for specific view

**There is no conflict. They are complementary.**

---

## 🎯 Distinct Responsibilities

### **Entity (Domain Layer)**

**Responsibility:** Logic **intrinsic** to the concept.

```typescript
// ✅ Question: "What IS a Pokemon?"
class PokemonListItem {
  getSizeCategory(): "small" | "medium" | "large" {
    // Business rule: size classification
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }

  isBossTier(): boolean {
    // Business rule: what is "boss-tier"
    return this.height > 30;
  }
}
```

**Key question:** Is this logic **inherent to the concept of Pokemon** regardless of how/where it's displayed?
- ✅ Yes → Goes in the Entity
- ❌ No → Goes in the ViewModel

---

### **ViewModel (Application Layer)**

**Responsibility:** Prepare data **for a specific view**.

```typescript
// ✅ Question: "How do I present these Pokemon in THIS view?"
class PokemonListViewModel {
  // Coordinates Use Cases
  async loadPokemonList(type: string): Promise<PokemonListItem[]> {
    const useCase = new GetPokemonListUseCase(this.repository);
    return await useCase.execute(new PokemonType(type));
  }

  // Orchestrates sorting
  sortPokemonListByHeight(list: PokemonListItem[]): PokemonListItem[] {
    return SortPokemonsByHeightUseCase.execute(list);
  }

  // ✅ THIS IS VIEWMODEL RESPONSIBILITY
  // Prepares data specific to the list view
  getPokemonListDisplayData(list: PokemonListItem[]): PokemonDisplayData[] {
    return list.map(pokemon => ({
      id: pokemon.id,
      displayName: pokemon.getDisplayName(), // ← Uses entity method
      heightLabel: `${pokemon.getHeightInMeters()}m`, // ← Uses entity method
      sizeCategory: pokemon.getSizeCategory(), // ← Uses entity method
      showBossBadge: pokemon.isBossTier(), // ← Uses entity method
      imageUrl: pokemon.imageUrl,
    }));
  }
}
```

**Key question:** Is this logic about **how to present** data in a specific view?
- ✅ Yes → Goes in the ViewModel
- ❌ No → Probably goes in the Entity or Use Case

---

## 📊 Side-by-Side Comparison

| Aspect | Entity | ViewModel |
|--------|--------|-----------|
| **Layer** | Domain | Application |
| **Question** | "What IS?" | "How is it SHOWN?" |
| **Example** | `getSizeCategory()` | `getPokemonListDisplayData()` |
| **Purpose** | Universal business rules | Prepare data for specific view |
| **Reusable in** | Entire application | Only in similar views |
| **Independent of** | Framework, UI | Framework (but knows domain) |
| **Testable without** | UI, HTTP, React | UI, HTTP (but needs domain) |
| **Changes when** | Business rules change | UI requirements change |

---

## 💡 Complete Example: Flow of Responsibilities

### **Real case:** Display list with size badges and formatted labels

---

### **1. Entity (Domain) - Business Rules**

```typescript
// domain/entities/PokemonListItem.ts
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public height: number,
    public imageUrl: string
  ) {}

  // ✅ Business rule: What size is it?
  getSizeCategory(): "small" | "medium" | "large" {
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }

  // ✅ Business rule: Is it boss-tier?
  isBossTier(): boolean {
    return this.height > 30;
  }

  // ✅ Business rule: Unit conversion
  getHeightInMeters(): number {
    return this.height / 10;
  }

  // ✅ Business rule: Capitalized name
  getDisplayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
}
```

**Tests (no UI, no HTTP):**

```typescript
// domain/entities/__tests__/PokemonListItem.test.ts
describe("PokemonListItem", () => {
  it("should classify small pokemon correctly", () => {
    const pikachu = new PokemonListItem("1", "pikachu", 4, "img.png");

    expect(pikachu.getSizeCategory()).toBe("small");
    expect(pikachu.isConsideredLarge()).toBe(false);
    expect(pikachu.isBossTier()).toBe(false);
  });

  it("should classify large pokemon correctly", () => {
    const onix = new PokemonListItem("3", "onix", 88, "img.png");

    expect(onix.getSizeCategory()).toBe("large");
    expect(onix.isConsideredLarge()).toBe(true);
    expect(onix.isBossTier()).toBe(true);
  });

  it("should convert height to meters", () => {
    const charizard = new PokemonListItem("2", "charizard", 17, "img.png");

    expect(charizard.getHeightInMeters()).toBe(1.7);
  });

  it("should capitalize display name", () => {
    const bulbasaur = new PokemonListItem("4", "bulbasaur", 7, "img.png");

    expect(bulbasaur.getDisplayName()).toBe("Bulbasaur");
  });
});
```

---

### **2. ViewModel (Application) - Preparation for View**

```typescript
// application/view-models/PokemonListViewModel.ts

// DTO for specific view
export interface PokemonListItemDisplay {
  id: string;
  displayName: string;
  heightLabel: string;
  sizeCategory: "small" | "medium" | "large";
  sizeBadgeColor: string; // ← Presentation decision
  showBossCrown: boolean;
  imageUrl: string;
}

export class PokemonListViewModel {
  constructor(private readonly repository: PokemonRepository) {}

  async loadPokemonList(type: string): Promise<PokemonListItem[]> {
    if (type === "") {
      return [];
    }

    const pokemonType = new PokemonType(type);
    const useCase = new GetPokemonListUseCase(this.repository);
    return await useCase.execute(pokemonType);
  }

  sortPokemonListByHeight(list: PokemonListItem[]): PokemonListItem[] {
    return SortPokemonsByHeightUseCase.execute(list);
  }

  // ✅ VIEWMODEL RESPONSIBILITY
  // Transforms domain entities into data ready for the view
  prepareForDisplay(list: PokemonListItem[]): PokemonListItemDisplay[] {
    return list.map(pokemon => ({
      id: pokemon.id,
      displayName: pokemon.getDisplayName(), // ← Uses entity
      heightLabel: `${pokemon.getHeightInMeters()}m`, // ← Uses entity
      sizeCategory: pokemon.getSizeCategory(), // ← Uses entity

      // ✅ PRESENTATION decision (not a business rule)
      sizeBadgeColor: this.getBadgeColorForSize(pokemon.getSizeCategory()),

      showBossCrown: pokemon.isBossTier(), // ← Uses entity
      imageUrl: pokemon.imageUrl,
    }));
  }

  // ✅ Presentation logic specific to this view
  private getBadgeColorForSize(size: "small" | "medium" | "large"): string {
    const colorMap = {
      small: "#10B981",  // green-500 (Tailwind)
      medium: "#F59E0B", // amber-500
      large: "#EF4444",  // red-500
    };
    return colorMap[size];
  }
}
```

**Tests (no UI, with mocked repository):**

```typescript
// application/view-models/__tests__/PokemonListViewModel.test.ts
describe("PokemonListViewModel", () => {
  it("should prepare pokemon list for display", () => {
    const mockRepository = createMockRepository();
    const viewModel = new PokemonListViewModel(mockRepository);

    const pokemonList = [
      new PokemonListItem("1", "pikachu", 4, "img1.png"),
      new PokemonListItem("2", "charizard", 17, "img2.png"),
      new PokemonListItem("3", "onix", 88, "img3.png"),
    ];

    const displayData = viewModel.prepareForDisplay(pokemonList);

    expect(displayData).toEqual([
      {
        id: "1",
        displayName: "Pikachu",
        heightLabel: "0.4m",
        sizeCategory: "small",
        sizeBadgeColor: "#10B981",
        showBossCrown: false,
        imageUrl: "img1.png",
      },
      {
        id: "2",
        displayName: "Charizard",
        heightLabel: "1.7m",
        sizeCategory: "medium",
        sizeBadgeColor: "#F59E0B",
        showBossCrown: false,
        imageUrl: "img2.png",
      },
      {
        id: "3",
        displayName: "Onix",
        heightLabel: "8.8m",
        sizeCategory: "large",
        sizeBadgeColor: "#EF4444",
        showBossCrown: true,
        imageUrl: "img3.png",
      },
    ]);
  });

  it("should return correct badge color for each size", () => {
    const viewModel = new PokemonListViewModel(mockRepository);

    // Access private method for testing (or make public if needed)
    expect(viewModel['getBadgeColorForSize']("small")).toBe("#10B981");
    expect(viewModel['getBadgeColorForSize']("medium")).toBe("#F59E0B");
    expect(viewModel['getBadgeColorForSize']("large")).toBe("#EF4444");
  });
});
```

---

### **3. Hook (Infrastructure) - React Adapter**

```typescript
// infrastructure/react/hooks/usePokemonList.ts
interface UsePokemonListResult {
  displayData: PokemonListItemDisplay[];
  isLoading: boolean;
  isError: boolean;
}

function usePokemonList(selectedType: string): UsePokemonListResult {
  const [displayData, setDisplayData] = useState<PokemonListItemDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Setup infrastructure
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

  useEffect(() => {
    if (!selectedType) {
      setDisplayData([]);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        // 1. Load entities from domain
        const pokemonList = await viewModel.loadPokemonList(selectedType);

        // 2. Transform for view
        const prepared = viewModel.prepareForDisplay(pokemonList);

        setDisplayData(prepared);
      } catch (error) {
        console.error("Error fetching pokemon list:", error);
        setDisplayData([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedType, viewModel]);

  return { displayData, isLoading, isError };
}
```

---

### **4. UI (Presentation) - Humble Component**

```typescript
// ui/PokemonList.tsx
const PokemonList = () => {
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get("type");

  // Hook exposes data prepared by the ViewModel
  const { displayData, isLoading, isError } = usePokemonList(selectedType ?? "");

  if (isLoading) {
    return (
      <section>
        <h3>Loading pokemon list...</h3>
      </section>
    );
  }

  if (isError) {
    return (
      <section>
        <h3>Error loading pokemon list. Please try again.</h3>
      </section>
    );
  }

  return (
    <section>
      <ul aria-label="Pokemon List">
        {displayData.map(pokemon => (
          <li key={pokemon.id}>
            {/* ✅ Component only renders, doesn't calculate */}
            <Badge
              type={pokemon.sizeCategory}
              color={pokemon.sizeBadgeColor} // ← From ViewModel
            />

            {pokemon.showBossCrown && <Crown />}

            <img src={pokemon.imageUrl} alt={pokemon.displayName} />
            <h3>{pokemon.displayName}</h3> {/* ← From Entity via ViewModel */}
            <p>{pokemon.heightLabel}</p> {/* ← From Entity via ViewModel */}
          </li>
        ))}
      </ul>
    </section>
  );
};
```

---

## 🎯 Decision Rules: Where does each thing go?

### **Goes in the ENTITY if:**

- ✅ It's a universal business rule (valid in any context)
- ✅ It's inherent to the concept (e.g., "a large Pokemon is > 20")
- ✅ It's reused in multiple views/contexts
- ✅ It's testable without knowing how it's displayed
- ✅ It doesn't depend on presentation technology (colors, UI formats)
- ✅ It's part of the domain's "ubiquitous language"

**Correct examples:**

```typescript
// ✅ Universal domain rules
pokemon.getSizeCategory()           // "What size is it?"
pokemon.isBossTier()                // "Is it boss-tier?"
pokemon.getHeightInMeters()         // "How tall in meters?"
pokemon.getDisplayName()            // "How is its name capitalized?"
pokemon.isConsideredLarge()         // "Is it considered large?"
pokemon.isTallerThan(otherPokemon)  // "Is it taller than another?"
```

**INCORRECT examples (don't go in Entity):**

```typescript
// ❌ UI/presentation decisions
pokemon.getBadgeColor()             // Color is UI decision
pokemon.getFormattedHeight()        // Format depends on the view
pokemon.shouldShowWarning()         // "Warning" is UI concept
pokemon.getCssClass()               // CSS is implementation detail
```

---

### **Goes in the VIEWMODEL if:**

- ✅ It's **preparation** logic for a specific view
- ✅ It decides **what to show** or **how to format** for the UI
- ✅ It combines/orchestrates multiple entities or use cases
- ✅ It depends on the **presentation context**
- ✅ It transforms domain entities into view DTOs
- ✅ It decides colors, icons, visual labels

**Correct examples:**

```typescript
// ✅ Preparation for specific view
viewModel.prepareForDisplay(list)              // Transform for view
viewModel.getBadgeColorForSize("large")        // UI decision
viewModel.loadPokemonList(type)                // Orchestrate use cases
viewModel.sortPokemonListByHeight(list)        // Orchestrate use cases
viewModel.getFilteredAndSortedList(...)        // Combine operations
viewModel.getPaginatedResults(page, pageSize)  // Pagination logic
```

**INCORRECT examples (don't go in ViewModel):**

```typescript
// ❌ Universal business rules
viewModel.calculatePokemonSize(height)  // Goes in Entity
viewModel.isPokemonBoss(height)         // Goes in Entity
viewModel.convertToMeters(height)       // Goes in Entity
```

---

## 📐 Responsibility Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ENTITY (Domain)                                          │
│ "WHAT IS a Pokemon?"                                        │
│                                                              │
│ ✅ getSizeCategory() → "small" | "medium" | "large"         │
│ ✅ isBossTier() → boolean                                   │
│ ✅ getHeightInMeters() → number                             │
│ ✅ getDisplayName() → string                                │
│                                                              │
│ Tests: 100% without UI, without HTTP, without React         │
└─────────────────────────────────────────────────────────────┘
                            ↓ uses
┌─────────────────────────────────────────────────────────────┐
│ 2. VIEWMODEL (Application)                                  │
│ "HOW do I present Pokemon in this view?"                    │
│                                                              │
│ ✅ prepareForDisplay(list) → PokemonDisplayData[]           │
│    - Calls pokemon.getDisplayName()                         │
│    - Calls pokemon.getSizeCategory()                        │
│    - Decides sizeBadgeColor based on category               │
│    - Calls pokemon.isBossTier()                             │
│                                                              │
│ ✅ loadPokemonList(type) → orchestrates GetPokemonListUseCase│
│ ✅ sortPokemonListByHeight(list) → orchestrates SortUseCase │
│                                                              │
│ Tests: Without UI, with mocked repository                   │
└─────────────────────────────────────────────────────────────┘
                            ↓ exposes
┌─────────────────────────────────────────────────────────────┐
│ 3. HOOK (Infrastructure)                                    │
│ "Adapter between React and ViewModel"                       │
│                                                              │
│ ✅ Manages React state (useState)                           │
│ ✅ Manages effects (useEffect)                              │
│ ✅ Instantiates dependencies (HttpClient, Repository)       │
│ ✅ Calls viewModel.loadPokemonList()                        │
│ ✅ Calls viewModel.prepareForDisplay()                      │
│ ✅ Exposes displayData to component                         │
└─────────────────────────────────────────────────────────────┘
                            ↓ consumes
┌─────────────────────────────────────────────────────────────┐
│ 4. UI (React Component)                                     │
│ "I render what the ViewModel prepared"                      │
│                                                              │
│ ✅ <Badge color={pokemon.sizeBadgeColor} />                 │
│ ✅ <h3>{pokemon.displayName}</h3>                           │
│ ✅ <p>{pokemon.heightLabel}</p>                             │
│                                                              │
│ Does NOT calculate, does NOT decide, only renders           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Data Flow

### **Scenario:** User selects "fire" type

```
┌──────────────────────────────────────────────────────────────┐
│ USER ACTION                                                  │
│ Clicks "fire" type → URL: ?type=fire                         │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ UI COMPONENT (PokemonList.tsx)                               │
│ const { displayData } = usePokemonList("fire")               │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ HOOK (usePokemonList.ts)                                     │
│ 1. pokemonList = await viewModel.loadPokemonList("fire")     │
│ 2. displayData = viewModel.prepareForDisplay(pokemonList)    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ VIEWMODEL (PokemonListViewModel.ts)                          │
│                                                               │
│ loadPokemonList("fire"):                                     │
│   ├─ new PokemonType("fire")                                 │
│   ├─ new GetPokemonListUseCase(repository)                   │
│   └─ useCase.execute(pokemonType)                            │
│       └─ Returns: PokemonListItem[] (domain entities)        │
│                                                               │
│ prepareForDisplay(pokemonList):                              │
│   ├─ pokemon.getDisplayName() ← Entity                       │
│   ├─ pokemon.getSizeCategory() ← Entity                      │
│   ├─ pokemon.getHeightInMeters() ← Entity                    │
│   ├─ getBadgeColorForSize(...) ← ViewModel                   │
│   └─ pokemon.isBossTier() ← Entity                           │
│       └─ Returns: PokemonDisplayData[] (DTO for view)        │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ ENTITY (PokemonListItem.ts)                                  │
│                                                               │
│ getSizeCategory():                                           │
│   if (this.height < 10) return "small"                       │
│   if (this.height <= 20) return "medium"                     │
│   return "large"                                             │
│                                                               │
│ isBossTier():                                                │
│   return this.height > 30                                    │
│                                                               │
│ getHeightInMeters():                                         │
│   return this.height / 10                                    │
└──────────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────────┐
│ UI RENDERS                                                   │
│ {displayData.map(pokemon => (                                │
│   <Badge color={pokemon.sizeBadgeColor} />                   │
│   <h3>{pokemon.displayName}</h3>                             │
│   <p>{pokemon.heightLabel}</p>                               │
│ ))}                                                          │
└──────────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing Strategy: Each Layer Separately

### **1. Entity Tests (Domain)**

```typescript
// ✅ Fast tests, no dependencies
describe("PokemonListItem", () => {
  it("should classify pokemon by size", () => {
    const pikachu = new PokemonListItem("1", "pikachu", 4, "img.png");
    const charizard = new PokemonListItem("2", "charizard", 17, "img.png");
    const onix = new PokemonListItem("3", "onix", 88, "img.png");

    expect(pikachu.getSizeCategory()).toBe("small");
    expect(charizard.getSizeCategory()).toBe("medium");
    expect(onix.getSizeCategory()).toBe("large");
  });

  it("should identify boss-tier pokemon", () => {
    const gyarados = new PokemonListItem("4", "gyarados", 65, "img.png");
    const pidgey = new PokemonListItem("5", "pidgey", 3, "img.png");

    expect(gyarados.isBossTier()).toBe(true);
    expect(pidgey.isBossTier()).toBe(false);
  });
});
```

**Characteristics:**
- ⚡ Super fast (no I/O)
- 🎯 Test pure business rules
- 🔒 Don't depend on React, HTTP, UI

---

### **2. ViewModel Tests (Application)**

```typescript
// ✅ Tests with mocked repository
describe("PokemonListViewModel", () => {
  it("should prepare pokemon for display with correct formatting", () => {
    const mockRepo = createMockRepository();
    const viewModel = new PokemonListViewModel(mockRepo);

    const pokemon = new PokemonListItem("1", "charizard", 17, "img.png");
    const display = viewModel.prepareForDisplay([pokemon]);

    expect(display[0]).toEqual({
      id: "1",
      displayName: "Charizard",  // ← Capitalized by entity
      heightLabel: "1.7m",        // ← Formatted by ViewModel
      sizeCategory: "medium",     // ← Calculated by entity
      sizeBadgeColor: "#F59E0B",  // ← Decided by ViewModel
      showBossCrown: false,       // ← Calculated by entity
      imageUrl: "img.png",
    });
  });

  it("should assign correct badge colors based on size", () => {
    const viewModel = new PokemonListViewModel(mockRepo);

    const small = new PokemonListItem("1", "pikachu", 4, "img.png");
    const medium = new PokemonListItem("2", "charizard", 17, "img.png");
    const large = new PokemonListItem("3", "onix", 88, "img.png");

    const displays = viewModel.prepareForDisplay([small, medium, large]);

    expect(displays[0].sizeBadgeColor).toBe("#10B981"); // green
    expect(displays[1].sizeBadgeColor).toBe("#F59E0B"); // amber
    expect(displays[2].sizeBadgeColor).toBe("#EF4444"); // red
  });
});
```

**Characteristics:**
- 🔌 Mocked repository (no real HTTP)
- 🎨 Test data transformation for UI
- 📦 Test orchestration of use cases

---

### **3. Hook Tests (Infrastructure)**

```typescript
// ✅ Tests with renderHook from @testing-library/react
describe("usePokemonList", () => {
  it("should return display data ready for rendering", async () => {
    const mockRepo = createMockRepository();

    const { result } = renderHook(() =>
      usePokemonList("fire", mockRepo)
    );

    await waitFor(() => {
      expect(result.current.displayData).toHaveLength(3);
    });

    expect(result.current.displayData[0]).toMatchObject({
      displayName: "Charmander",
      heightLabel: "0.6m",
      sizeCategory: "small",
      sizeBadgeColor: "#10B981",
    });
  });
});
```

**Characteristics:**
- ⚛️ Test integration with React
- 🔄 Test states (loading, error, success)
- 🎭 Mock repository, no real API

---

### **4. UI Tests (Presentation)**

```typescript
// ✅ End-to-end tests with mocked API
describe("PokemonList", () => {
  it("should render pokemon with badges and crowns", async () => {
    setupMockAPI(); // Mock fetch responses

    render(
      <MemoryRouter initialEntries={["/?type=fire"]}>
        <PokemonList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Charmander")).toBeInTheDocument();
    });

    const smallBadge = screen.getByRole("img", { name: /small/i });
    expect(smallBadge).toHaveStyle({ backgroundColor: "#10B981" });
  });
});
```

**Characteristics:**
- 🎬 Test complete flow
- 🖥️ Verify correct rendering
- 🎭 Mock API, no real calls

---

## ✅ Conclusion: Collaboration, Not Conflict

```
┌─────────────────────────────────────────────────────────────┐
│ ENTITY (Domain)                                             │
│ "WHAT IS a Pokemon?"                                        │
│                                                              │
│ ✅ Encapsulates universal business rules                    │
│ ✅ Testable without frameworks                              │
│ ✅ Reused throughout the application                        │
│                                                              │
│ Example: getSizeCategory(), isBossTier()                    │
└─────────────────────────────────────────────────────────────┘
                          ↓ uses
┌─────────────────────────────────────────────────────────────┐
│ VIEWMODEL (Application)                                     │
│ "HOW do I present Pokemon in this view?"                    │
│                                                              │
│ ✅ Orchestrates use cases                                   │
│ ✅ Transforms entities for UI                               │
│ ✅ Decides presentation aspects                             │
│                                                              │
│ Example: prepareForDisplay(), getBadgeColorForSize()        │
└─────────────────────────────────────────────────────────────┘
                          ↓ exposes
┌─────────────────────────────────────────────────────────────┐
│ UI (React)                                                  │
│ "I render what the ViewModel prepared"                      │
│                                                              │
│ ✅ "Humble" component                                       │
│ ✅ Only renders, doesn't calculate                          │
│ ✅ Contains no business logic                               │
│                                                              │
│ Example: <Badge color={pokemon.sizeBadgeColor} />           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Benefits of This Separation

### **1. Testability**
```typescript
// ✅ Each layer tested independently
domain:         tests without UI, without HTTP, without React
application:    tests without UI, with mocked repository
infrastructure: tests with React, with mocked repository
ui:             end-to-end tests with mocked API
```

### **2. Reusability**
```typescript
// ✅ Entity reusable throughout the app
pokemon.getSizeCategory()  // In PokemonList
pokemon.getSizeCategory()  // In PokemonDetail
pokemon.getSizeCategory()  // In PokemonCard
pokemon.getSizeCategory()  // In PokemonComparison
```

### **3. Maintainability**
```typescript
// ✅ Changes are localized
Business rule changes      → Only modify Entity
Badge color changes        → Only modify ViewModel
Framework change (Vue)     → Only modify UI
```

### **4. Clarity**
```typescript
// ✅ Each class has single responsibility
PokemonListItem    → "What IS a Pokemon?"
PokemonListViewModel → "How do I PRESENT Pokemon?"
PokemonList          → "How do I RENDER Pokemon?"
```

---

## 🚀 Final Summary

**There is no conflict between Entity and ViewModel.**

They are **complementary** and work together:

1. **Entity** defines and encapsulates business rules
2. **ViewModel** uses those rules to prepare data
3. **UI** renders the prepared data

**It's collaboration across layers, each with its clear responsibility.**

---

**Author:** Ricardo (Claude Sonnet 4.5)
**Context:** Hexagonal Refactor - Feature pokemon-list
**Branch:** `refactor-list-to-hexagonal`
