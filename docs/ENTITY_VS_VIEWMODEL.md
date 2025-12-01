# Entidad vs ViewModel: Responsabilidades Complementarias

## 📋 TL;DR

**Entidad (Domain):** "¿Qué ES este concepto?" → Reglas de negocio universales  
**ViewModel (Application):** "¿Cómo PRESENTO esto?" → Preparación para vista específica

**No hay conflicto. Son complementarios.**

---

## 🎯 Responsabilidades distintas

### **Entidad (Domain Layer)**

**Responsabilidad:** Lógica de negocio **intrínseca** al concepto.

```typescript
// ✅ Pregunta: "¿Qué ES un Pokemon?"
class PokemonListItem {
  getSizeCategory(): "small" | "medium" | "large" {
    // Regla de negocio: clasificación de tamaño
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }
  
  isBossTier(): boolean {
    // Regla de negocio: qué es "boss-tier"
    return this.height > 30;
  }
}
```

**Pregunta clave:** ¿Esta lógica es **inherente al concepto de Pokemon** independientemente de cómo/dónde se muestre?
- ✅ Sí → Va en la Entidad
- ❌ No → Va en el ViewModel

---

### **ViewModel (Application Layer)**

**Responsabilidad:** Preparar datos **para una vista específica**.

```typescript
// ✅ Pregunta: "¿Cómo presento estos Pokemon en ESTA vista?"
class PokemonListViewModel {
  // Coordina Use Cases
  async loadPokemonList(type: string): Promise<PokemonListItem[]> {
    const useCase = new GetPokemonListUseCase(this.repository);
    return await useCase.execute(new PokemonType(type));
  }

  // Orquesta ordenamiento
  sortPokemonListByHeight(list: PokemonListItem[]): PokemonListItem[] {
    return SortPokemonsByHeightUseCase.execute(list);
  }

  // ✅ ESTO SÍ ES RESPONSABILIDAD DEL VIEWMODEL
  // Prepara datos específicos para la vista de lista
  getPokemonListDisplayData(list: PokemonListItem[]): PokemonDisplayData[] {
    return list.map(pokemon => ({
      id: pokemon.id,
      displayName: pokemon.getDisplayName(), // ← Usa método de la entidad
      heightLabel: `${pokemon.getHeightInMeters()}m`, // ← Usa método de la entidad
      sizeCategory: pokemon.getSizeCategory(), // ← Usa método de la entidad
      showBossBadge: pokemon.isBossTier(), // ← Usa método de la entidad
      imageUrl: pokemon.imageUrl,
    }));
  }
}
```

**Pregunta clave:** ¿Esta lógica es sobre **cómo presentar** datos en una vista específica?
- ✅ Sí → Va en el ViewModel
- ❌ No → Probablemente va en la Entidad o Use Case

---

## 📊 Comparación lado a lado

| Aspecto | Entidad | ViewModel |
|---------|---------|-----------|
| **Capa** | Domain | Application |
| **Pregunta** | "¿Qué ES?" | "¿Cómo se MUESTRA?" |
| **Ejemplo** | `getSizeCategory()` | `getPokemonListDisplayData()` |
| **Propósito** | Reglas de negocio universales | Preparar datos para vista específica |
| **Reutilizable en** | Toda la aplicación | Solo en vistas similares |
| **Independiente de** | Framework, UI | Framework (pero conoce el domain) |
| **Testeable sin** | UI, HTTP, React | UI, HTTP (pero necesita domain) |
| **Cambia cuando** | Cambian reglas de negocio | Cambian requisitos de UI |

---

## 💡 Ejemplo Completo: Flujo de responsabilidades

### **Caso real:** Mostrar lista con badges de tamaño y etiquetas formateadas

---

### **1. Entidad (Domain) - Reglas de negocio**

```typescript
// domain/entities/PokemonListItem.ts
export class PokemonListItem {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public height: number,
    public imageUrl: string
  ) {}

  // ✅ Regla de negocio: ¿Qué tamaño es?
  getSizeCategory(): "small" | "medium" | "large" {
    if (this.height < 10) return "small";
    if (this.height <= 20) return "medium";
    return "large";
  }

  // ✅ Regla de negocio: ¿Es boss-tier?
  isBossTier(): boolean {
    return this.height > 30;
  }

  // ✅ Regla de negocio: Conversión de unidades
  getHeightInMeters(): number {
    return this.height / 10;
  }

  // ✅ Regla de negocio: Nombre capitalizado
  getDisplayName(): string {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
  }
}
```

**Tests (sin UI, sin HTTP):**

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

### **2. ViewModel (Application) - Preparación para vista**

```typescript
// application/view-models/PokemonListViewModel.ts

// DTO para la vista específica
export interface PokemonListItemDisplay {
  id: string;
  displayName: string;
  heightLabel: string;
  sizeCategory: "small" | "medium" | "large";
  sizeBadgeColor: string; // ← Decisión de presentación
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

  // ✅ RESPONSABILIDAD DEL VIEWMODEL
  // Transforma entidades de domain en datos listos para la vista
  prepareForDisplay(list: PokemonListItem[]): PokemonListItemDisplay[] {
    return list.map(pokemon => ({
      id: pokemon.id,
      displayName: pokemon.getDisplayName(), // ← Usa entidad
      heightLabel: `${pokemon.getHeightInMeters()}m`, // ← Usa entidad
      sizeCategory: pokemon.getSizeCategory(), // ← Usa entidad
      
      // ✅ Decisión de PRESENTACIÓN (no es regla de negocio)
      sizeBadgeColor: this.getBadgeColorForSize(pokemon.getSizeCategory()),
      
      showBossCrown: pokemon.isBossTier(), // ← Usa entidad
      imageUrl: pokemon.imageUrl,
    }));
  }

  // ✅ Lógica de presentación específica de esta vista
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

**Tests (sin UI, con mock del repository):**

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
    
    // Acceder al método privado para testing (o hacer público si es necesario)
    expect(viewModel['getBadgeColorForSize']("small")).toBe("#10B981");
    expect(viewModel['getBadgeColorForSize']("medium")).toBe("#F59E0B");
    expect(viewModel['getBadgeColorForSize']("large")).toBe("#EF4444");
  });
});
```

---

### **3. Hook (Infrastructure) - Adaptador React**

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
        // 1. Cargar entidades de domain
        const pokemonList = await viewModel.loadPokemonList(selectedType);
        
        // 2. Transformar para vista
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

### **4. UI (Presentación) - Humble Component**

```typescript
// ui/PokemonList.tsx
const PokemonList = () => {
  const [searchParams] = useSearchParams();
  const selectedType = searchParams.get("type");

  // Hook expone datos preparados por el ViewModel
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
            {/* ✅ Componente solo renderiza, no calcula */}
            <Badge 
              type={pokemon.sizeCategory} 
              color={pokemon.sizeBadgeColor} // ← Del ViewModel
            />
            
            {pokemon.showBossCrown && <Crown />}
            
            <img src={pokemon.imageUrl} alt={pokemon.displayName} />
            <h3>{pokemon.displayName}</h3> {/* ← De la Entidad vía ViewModel */}
            <p>{pokemon.heightLabel}</p> {/* ← De la Entidad vía ViewModel */}
          </li>
        ))}
      </ul>
    </section>
  );
};
```

---

## 🎯 Reglas de decisión: ¿Dónde va cada cosa?

### **Va en la ENTIDAD si:**

- ✅ Es una regla de negocio universal (válida en todo contexto)
- ✅ Es inherente al concepto (ej: "un Pokemon grande es > 20")
- ✅ Se reutiliza en múltiples vistas/contextos
- ✅ Es testeable sin saber cómo se muestra
- ✅ No depende de tecnología de presentación (colores, formatos UI)
- ✅ Es parte del "lenguaje ubiquo" del dominio

**Ejemplos correctos:**

```typescript
// ✅ Reglas universales del dominio
pokemon.getSizeCategory()           // "¿Qué tamaño tiene?"
pokemon.isBossTier()                // "¿Es boss-tier?"
pokemon.getHeightInMeters()         // "¿Cuánto mide en metros?"
pokemon.getDisplayName()            // "¿Cómo se capitaliza su nombre?"
pokemon.isConsideredLarge()         // "¿Se considera grande?"
pokemon.isTallerThan(otherPokemon)  // "¿Es más alto que otro?"
```

**Ejemplos INCORRECTOS (no van en Entidad):**

```typescript
// ❌ Decisiones de UI/presentación
pokemon.getBadgeColor()             // Color es decisión de UI
pokemon.getFormattedHeight()        // Formato depende de la vista
pokemon.shouldShowWarning()         // "Warning" es concepto de UI
pokemon.getCssClass()               // CSS es detalle de implementación
```

---

### **Va en el VIEWMODEL si:**

- ✅ Es lógica de **preparación** para una vista específica
- ✅ Decide **qué mostrar** o **cómo formatear** para la UI
- ✅ Combina/orquesta múltiples entidades o use cases
- ✅ Depende del **contexto de presentación**
- ✅ Transforma entidades de dominio en DTOs de vista
- ✅ Decide colores, iconos, etiquetas visuales

**Ejemplos correctos:**

```typescript
// ✅ Preparación para vista específica
viewModel.prepareForDisplay(list)              // Transforma para vista
viewModel.getBadgeColorForSize("large")        // Decisión de UI
viewModel.loadPokemonList(type)                // Orquesta use cases
viewModel.sortPokemonListByHeight(list)        // Orquesta use cases
viewModel.getFilteredAndSortedList(...)        // Combina operaciones
viewModel.getPaginatedResults(page, pageSize)  // Lógica de paginación
```

**Ejemplos INCORRECTOS (no van en ViewModel):**

```typescript
// ❌ Reglas de negocio universales
viewModel.calculatePokemonSize(height)  // Va en Entidad
viewModel.isPokemonBoss(height)         // Va en Entidad
viewModel.convertToMeters(height)       // Va en Entidad
```

---

## 📐 Diagrama de flujo de responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ENTIDAD (Domain)                                         │
│ "¿QUÉ ES un Pokemon?"                                       │
│                                                              │
│ ✅ getSizeCategory() → "small" | "medium" | "large"         │
│ ✅ isBossTier() → boolean                                   │
│ ✅ getHeightInMeters() → number                             │
│ ✅ getDisplayName() → string                                │
│                                                              │
│ Tests: 100% sin UI, sin HTTP, sin React                     │
└─────────────────────────────────────────────────────────────┘
                            ↓ usa
┌─────────────────────────────────────────────────────────────┐
│ 2. VIEWMODEL (Application)                                  │
│ "¿CÓMO presento Pokemon en esta vista?"                     │
│                                                              │
│ ✅ prepareForDisplay(list) → PokemonDisplayData[]           │
│    - Llama a pokemon.getDisplayName()                       │
│    - Llama a pokemon.getSizeCategory()                      │
│    - Decide sizeBadgeColor según categoria                  │
│    - Llama a pokemon.isBossTier()                           │
│                                                              │
│ ✅ loadPokemonList(type) → orquesta GetPokemonListUseCase   │
│ ✅ sortPokemonListByHeight(list) → orquesta SortUseCase     │
│                                                              │
│ Tests: Sin UI, con mock repository                          │
└─────────────────────────────────────────────────────────────┘
                            ↓ expone
┌─────────────────────────────────────────────────────────────┐
│ 3. HOOK (Infrastructure)                                    │
│ "Adaptador entre React y ViewModel"                         │
│                                                              │
│ ✅ Gestiona estado React (useState)                         │
│ ✅ Gestiona efectos (useEffect)                             │
│ ✅ Instancia dependencias (HttpClient, Repository)          │
│ ✅ Llama a viewModel.loadPokemonList()                      │
│ ✅ Llama a viewModel.prepareForDisplay()                    │
│ ✅ Expone displayData al componente                         │
└─────────────────────────────────────────────────────────────┘
                            ↓ consume
┌─────────────────────────────────────────────────────────────┐
│ 4. UI (React Component)                                     │
│ "Renderizo lo que el ViewModel preparó"                     │
│                                                              │
│ ✅ <Badge color={pokemon.sizeBadgeColor} />                 │
│ ✅ <h3>{pokemon.displayName}</h3>                           │
│ ✅ <p>{pokemon.heightLabel}</p>                             │
│                                                              │
│ NO calcula, NO decide, solo renderiza                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de datos completo

### **Escenario:** Usuario selecciona tipo "fire"

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
│       └─ Returns: PokemonListItem[] (entidades de domain)    │
│                                                               │
│ prepareForDisplay(pokemonList):                              │
│   ├─ pokemon.getDisplayName() ← Entidad                      │
│   ├─ pokemon.getSizeCategory() ← Entidad                     │
│   ├─ pokemon.getHeightInMeters() ← Entidad                   │
│   ├─ getBadgeColorForSize(...) ← ViewModel                   │
│   └─ pokemon.isBossTier() ← Entidad                          │
│       └─ Returns: PokemonDisplayData[] (DTO para vista)      │
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

## 🧪 Testing Strategy: Cada capa por separado

### **1. Tests de Entidad (Domain)**

```typescript
// ✅ Tests rápidos, sin dependencias
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

**Características:**
- ⚡ Super rápidos (sin I/O)
- 🎯 Prueban reglas de negocio puras
- 🔒 No dependen de React, HTTP, UI

---

### **2. Tests de ViewModel (Application)**

```typescript
// ✅ Tests con mock del repository
describe("PokemonListViewModel", () => {
  it("should prepare pokemon for display with correct formatting", () => {
    const mockRepo = createMockRepository();
    const viewModel = new PokemonListViewModel(mockRepo);
    
    const pokemon = new PokemonListItem("1", "charizard", 17, "img.png");
    const display = viewModel.prepareForDisplay([pokemon]);

    expect(display[0]).toEqual({
      id: "1",
      displayName: "Charizard",  // ← Capitalizado por entidad
      heightLabel: "1.7m",        // ← Formateado por ViewModel
      sizeCategory: "medium",     // ← Calculado por entidad
      sizeBadgeColor: "#F59E0B",  // ← Decidido por ViewModel
      showBossCrown: false,       // ← Calculado por entidad
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

**Características:**
- 🔌 Mock del repository (no HTTP real)
- 🎨 Prueban transformación de datos para UI
- 📦 Prueban orquestación de use cases

---

### **3. Tests de Hook (Infrastructure)**

```typescript
// ✅ Tests con renderHook de @testing-library/react
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

**Características:**
- ⚛️ Prueban integración con React
- 🔄 Prueban estados (loading, error, success)
- 🎭 Mock del repository, no API real

---

### **4. Tests de UI (Presentación)**

```typescript
// ✅ Tests end-to-end con mocks de API
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

**Características:**
- 🎬 Prueban flujo completo
- 🖥️ Verifican renderizado correcto
- 🎭 Mock de API, no llamadas reales

---

## ✅ Conclusión: Colaboración, no conflicto

```
┌─────────────────────────────────────────────────────────┐
│ ENTIDAD (Domain)                                        │
│ "¿QUÉ ES un Pokemon?"                                   │
│                                                          │
│ ✅ Encapsula reglas de negocio universales              │
│ ✅ Es testeable sin frameworks                          │
│ ✅ Se reutiliza en toda la aplicación                   │
│                                                          │
│ Ejemplo: getSizeCategory(), isBossTier()                │
└─────────────────────────────────────────────────────────┘
                          ↓ usa
┌─────────────────────────────────────────────────────────┐
│ VIEWMODEL (Application)                                 │
│ "¿CÓMO presento Pokemon en esta vista?"                 │
│                                                          │
│ ✅ Orquesta use cases                                   │
│ ✅ Transforma entidades para UI                         │
│ ✅ Decide aspectos de presentación                      │
│                                                          │
│ Ejemplo: prepareForDisplay(), getBadgeColorForSize()    │
└─────────────────────────────────────────────────────────┘
                          ↓ expone
┌─────────────────────────────────────────────────────────┐
│ UI (React)                                              │
│ "Renderizo lo que el ViewModel preparó"                 │
│                                                          │
│ ✅ Componente "humble"                                  │
│ ✅ Solo renderiza, no calcula                           │
│ ✅ No contiene lógica de negocio                        │
│                                                          │
│ Ejemplo: <Badge color={pokemon.sizeBadgeColor} />       │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Beneficios de esta separación

### **1. Testabilidad**
```typescript
// ✅ Cada capa se testea independientemente
domain:         tests sin UI, sin HTTP, sin React
application:    tests sin UI, con mock repository
infrastructure: tests con React, con mock repository
ui:             tests end-to-end con mocks de API
```

### **2. Reusabilidad**
```typescript
// ✅ Entidad reutilizable en toda la app
pokemon.getSizeCategory()  // En PokemonList
pokemon.getSizeCategory()  // En PokemonDetail
pokemon.getSizeCategory()  // En PokemonCard
pokemon.getSizeCategory()  // En PokemonComparison
```

### **3. Mantenibilidad**
```typescript
// ✅ Cambios localizados
Cambia regla de negocio      → Solo modificas Entidad
Cambia color de badge        → Solo modificas ViewModel
Cambia framework (Vue, etc.) → Solo modificas UI
```

### **4. Claridad**
```typescript
// ✅ Cada clase tiene responsabilidad única
PokemonListItem    → "¿Qué ES un Pokemon?"
PokemonListViewModel → "¿Cómo PRESENTO Pokemon?"
PokemonList          → "¿Cómo RENDERIZO Pokemon?"
```

---

## 🚀 Resumen Final

**No hay conflicto entre Entidad y ViewModel.**

Son **complementarios** y trabajan juntos:

1. **Entidad** define y encapsula reglas de negocio
2. **ViewModel** usa esas reglas para preparar datos
3. **UI** renderiza los datos preparados

**Es colaboración en capas, cada una con su responsabilidad clara.**

---

**Autor:** Ricardo (Claude Sonnet 4.5)  
**Contexto:** Refactor Hexagonal - Feature pokemon-list  
**Branch:** `refactor-list-to-hexagonal`
