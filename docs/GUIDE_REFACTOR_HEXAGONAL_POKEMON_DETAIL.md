# 🔧 Hexagonal Refactor Guide: Feature `pokemon-detail`

## 📋 Metadata

- **Feature:** `pokemon-detail`
- **Initial State:** Legacy (fetch in components, no layer separation)
- **Target State:** Clean Architecture + Hexagonal (Ports & Adapters)
- **Complexity:** High (multiple API endpoints, subcomponents)
- **Reference:** Follow patterns from `pokemon-list` and `select-pokemon-type`

---

## 🎯 Refactor Objective

Transform the `pokemon-detail` feature from a monolithic React architecture to **Clean Architecture + Hexagonal**, applying the same patterns established in previous features.

**IMPORTANT:** Every component in this feature must be refactored. No component should make direct fetch calls. Each feature is self-contained and must not depend on other features.

### Current Problems

| Component                  | Problem                                      |
| -------------------------- | -------------------------------------------- |
| `PokemonDetail.tsx`        | Direct fetch, multiple coupled useEffects    |
| `PokemonEvolutions.tsx`    | Direct fetch, parsing logic in component     |
| `PokemonDetailTypes.tsx`   | Direct fetch, local state mixed with UI      |
| `pages/Detail/entities.ts` | Entities in wrong location (outside feature) |

### Target Structure

```
src/features/pokemon-detail/
├── domain/
│   ├── entities/
│   │   ├── PokemonDetail.ts          # Data container (no behavior)
│   │   └── EvolutionChain.ts         # WITH behavior → tests
│   ├── value-objects/
│   │   ├── PokemonStat.ts            # Data container (no behavior)
│   │   └── PokemonByType.ts          # Data container (no behavior)
│   ├── ports/
│   │   └── PokemonDetailRepository.ts
│   └── constants.ts
├── application/
│   ├── use-cases/
│   │   ├── get-pokemon-detail/
│   │   ├── get-evolution-chain/
│   │   └── get-pokemons-by-type/     # NEW: For PokemonDetailTypes
│   └── view-models/
│       ├── PokemonDetailViewModel.ts
│       ├── PokemonsByTypeViewModel.ts # NEW: For PokemonDetailTypes
│       └── __tests__/
├── infrastructure/
│   ├── http/
│   │   ├── HttpPokemonDetailRepository.ts
│   │   ├── dto/
│   │   └── __tests__/
│   └── react/
│       └── hooks/
│           ├── usePokemonDetail.ts
│           ├── usePokemonsByType.ts   # NEW: For PokemonDetailTypes
│           └── __tests__/
├── ui/
│   ├── PokemonDetail.tsx
│   ├── PokemonEvolutions.tsx
│   ├── PokemonStats.tsx
│   └── PokemonDetailTypes.tsx         # Humble component
├── __tests__/
│   └── mocks.ts
└── index.ts
```

---

## 📊 Execution Plan by Phases

| Phase | Description                            | New Tests                |
| ----- | -------------------------------------- | ------------------------ |
| 0     | Setup: Verify existing tests           | 0                        |
| 1     | Domain Layer (core)                    | ~3 (only EvolutionChain) |
| 2     | Infrastructure: HTTP Repository (core) | ~4                       |
| 3     | Application: Use Cases (core)          | ~8                       |
| 4     | Application: ViewModel (core)          | ~6                       |
| 5     | Infrastructure: Hook with DI (core)    | ~7                       |
| 6     | UI: PokemonDetail, Evolutions, Stats   | 0 (use existing)         |
| 7     | Domain Layer (PokemonsByType)          | 0 (data container)       |
| 8     | Infrastructure: Repository extension   | ~2                       |
| 9     | Application: GetPokemonsByTypeUseCase  | ~3                       |
| 10    | Application: PokemonsByTypeViewModel   | ~4                       |
| 11    | Infrastructure: usePokemonsByType hook | ~5                       |
| 12    | UI: PokemonDetailTypes (humble)        | 0                        |
| 13    | Cleanup and Final Verification         | 0                        |

**Total new tests: ~42**

---

## ✅ PHASE 0: Setup and Baseline Verification

### **Objective:**

Verify that existing integration tests pass before starting.

### **Prompt for the agent:**

```
Run the Detail page tests to establish the baseline before refactoring.

COMMAND:
npm test src/pages/Detail/__tests__/Detail.test.tsx

EXPECTED RESULT:
- All existing tests must pass
- Note how many tests exist and what they cover

If any test fails, DO NOT continue with the refactor until it's fixed.
```

### **Verification:**

```bash
npm test src/pages/Detail/__tests__/Detail.test.tsx
```

---

## ✅ PHASE 1: Domain Layer (Core)

### **1.1 Create folder structure**

### **Prompt for the agent:**

```
Create the folder structure for the pokemon-detail domain layer.

CREATE FOLDERS:
src/features/pokemon-detail/domain/
src/features/pokemon-detail/domain/entities/
src/features/pokemon-detail/domain/value-objects/
src/features/pokemon-detail/domain/ports/

CREATE constants file:
src/features/pokemon-detail/domain/constants.ts

CONTENT of constants.ts:
export const POKEMON_DETAIL_CONFIG = {
  DEFAULT_IMAGE: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png",
} as const;

VERIFICATION:
The structure must exist without errors.
```

---

### **1.2 Create Value Object: PokemonStat (Data Container - NO tests)**

### **Prompt for the agent:**

```
Create the PokemonStat Value Object in src/features/pokemon-detail/domain/value-objects/PokemonStat.ts

IMPORTANT: This is a DATA CONTAINER without behavior. DO NOT create tests (YAGNI).

CONTENT:
export class PokemonStat {
  constructor(
    public readonly name: string,
    public readonly baseStat: number,
    public readonly effort: number
  ) {}
}

NOTE: Do not add methods like getDisplayName(). The product CSS uses text-transform: capitalize.

VERIFICATION:
npm run build must pass.
```

---

### **1.3 Create Entity: EvolutionChain (WITH behavior → WITH tests)**

### **Prompt for the agent:**

```
Create the EvolutionChain Entity in src/features/pokemon-detail/domain/entities/EvolutionChain.ts

IMPORTANT: This entity HAS real behavior that the product uses → NEEDS tests.

CONTENT:
export class EvolutionChain {
  constructor(public readonly pokemonNames: string[]) {}

  /**
   * Returns the list of evolutions excluding the current pokemon.
   * This behavior is used in PokemonEvolutions.tsx to show
   * only the evolutions the user can navigate to.
   */
  getEvolutionsExcluding(currentName: string): string[] {
    return this.pokemonNames.filter((name) => name !== currentName);
  }
}

VERIFICATION:
npm run build must pass.
```

---

### **1.4 Create tests for EvolutionChain**

### **Prompt for the agent:**

```
Create tests for EvolutionChain.

FILE: src/features/pokemon-detail/domain/entities/__tests__/EvolutionChain.test.ts

CONTENT:
import { it, expect } from "vitest";
import { EvolutionChain } from "../EvolutionChain";

it("returns all evolutions excluding current pokemon", () => {
  const chain = new EvolutionChain(["bulbasaur", "ivysaur", "venusaur"]);

  const result = chain.getEvolutionsExcluding("bulbasaur");

  expect(result).toEqual(["ivysaur", "venusaur"]);
});

it("returns empty array when current pokemon is the only one", () => {
  const chain = new EvolutionChain(["ditto"]);

  const result = chain.getEvolutionsExcluding("ditto");

  expect(result).toEqual([]);
});

it("returns all pokemons when current name is not in chain", () => {
  const chain = new EvolutionChain(["bulbasaur", "ivysaur", "venusaur"]);

  const result = chain.getEvolutionsExcluding("pikachu");

  expect(result).toEqual(["bulbasaur", "ivysaur", "venusaur"]);
});

VERIFICATION:
npm test src/features/pokemon-detail/domain/entities/__tests__/EvolutionChain.test.ts
All tests must PASS.
```

---

### **1.5 Create Entity: PokemonDetail (Data Container - NO tests)**

### **Prompt for the agent:**

```
Create the PokemonDetail Entity in src/features/pokemon-detail/domain/entities/PokemonDetail.ts

IMPORTANT: This is a DATA CONTAINER without behavior. DO NOT create tests (YAGNI).

CONTENT:
import { PokemonStat } from "../value-objects/PokemonStat";

export class PokemonDetail {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly height: number,
    public readonly weight: number,
    public readonly imageUrl: string,
    public readonly stats: PokemonStat[],
    public readonly types: string[],
    public readonly speciesUrl: string
  ) {}
}

VERIFICATION:
npm run build must pass.
```

---

### **1.6 Create Port: PokemonDetailRepository**

### **Prompt for the agent:**

```
Create the Port (interface) PokemonDetailRepository in src/features/pokemon-detail/domain/ports/PokemonDetailRepository.ts

CONTENT:
import { PokemonDetail } from "../entities/PokemonDetail";
import { EvolutionChain } from "../entities/EvolutionChain";
import { PokemonByType } from "../value-objects/PokemonByType";

export interface PokemonDetailRepository {
  /**
   * Gets pokemon details by name
   */
  findByName(name: string): Promise<PokemonDetail>;

  /**
   * Gets the evolution chain URL from the species URL
   */
  findEvolutionChainUrl(speciesUrl: string): Promise<string>;

  /**
   * Gets the evolution chain from its URL
   */
  findEvolutionChain(evolutionChainUrl: string): Promise<EvolutionChain>;

  /**
   * Gets all pokemon of a specific type
   */
  findAllByType(typeName: string): Promise<PokemonByType[]>;
}

VERIFICATION:
npm run build must pass (will fail until PokemonByType exists - that's expected).
```

---

### **1.7 Create export indexes**

### **Prompt for the agent:**

```
Create index.ts files to export the domain layer.

FILE 1: src/features/pokemon-detail/domain/entities/index.ts
export { PokemonDetail } from "./PokemonDetail";
export { EvolutionChain } from "./EvolutionChain";

FILE 2: src/features/pokemon-detail/domain/value-objects/index.ts
export { PokemonStat } from "./PokemonStat";
export { PokemonByType } from "./PokemonByType";

FILE 3: src/features/pokemon-detail/domain/ports/index.ts
export type { PokemonDetailRepository } from "./PokemonDetailRepository";

FILE 4: src/features/pokemon-detail/domain/index.ts
export * from "./entities";
export * from "./value-objects";
export * from "./ports";
export * from "./constants";

NOTE: Build will fail until PokemonByType is created in Phase 7. Continue to Phase 2.

VERIFICATION:
Structure exists without syntax errors.
```

---

## ✅ PHASE 2: Infrastructure Layer (HTTP Repository - Core)

### **2.1 Create DTOs**

### **Prompt for the agent:**

```
Create DTOs for pokemon-detail.

FILE 1: src/features/pokemon-detail/infrastructure/http/dto/PokemonDetailDTO.ts

CONTENT:
export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
  };
  stats: StatResponse[];
  types: TypeResponse[];
  species: {
    name: string;
    url: string;
  };
}

export interface StatResponse {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
  };
}

export interface TypeResponse {
  slot: number;
  type: {
    name: string;
  };
}

FILE 2: src/features/pokemon-detail/infrastructure/http/dto/EvolutionChainDTO.ts

CONTENT:
export interface EvolutionChainResponse {
  chain: EvolutionChainLink;
}

export interface EvolutionChainLink {
  species: {
    name: string;
    url: string;
  };
  evolves_to: EvolutionChainLink[];
}

export interface SpeciesResponse {
  evolution_chain: {
    url: string;
  };
}

FILE 3: src/features/pokemon-detail/infrastructure/http/dto/PokemonByTypeDTO.ts

CONTENT:
export interface PokemonByTypeResponse {
  pokemon: PokemonSlot[];
}

export interface PokemonSlot {
  pokemon: {
    name: string;
    url: string;
  };
  slot: number;
}

FILE 4: src/features/pokemon-detail/infrastructure/http/dto/index.ts
export * from "./PokemonDetailDTO";
export * from "./EvolutionChainDTO";
export * from "./PokemonByTypeDTO";

VERIFICATION:
npm run build must pass.
```

---

### **2.2 Create HttpPokemonDetailRepository - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for HttpPokemonDetailRepository following TDD.

FILE: src/features/pokemon-detail/infrastructure/http/__tests__/HttpPokemonDetailRepository.test.ts

CONTENT:
import { it, expect, vi, beforeEach } from "vitest";
import { HttpPokemonDetailRepository } from "../HttpPokemonDetailRepository";
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";

let mockFetch: ReturnType<typeof vi.fn>;
let repository: HttpPokemonDetailRepository;

beforeEach(() => {
  mockFetch = vi.fn();
  globalThis.fetch = mockFetch;
  repository = new HttpPokemonDetailRepository("https://pokeapi.co/api/v2/", {
    pokemonEndpoint: "pokemon/",
    typeEndpoint: "type/",
  });
});

it("finds pokemon detail by name and maps to domain entity", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      id: 1,
      name: "bulbasaur",
      height: 7,
      weight: 69,
      sprites: { front_default: "https://sprite.png" },
      stats: [
        { base_stat: 45, effort: 0, stat: { name: "hp" } },
        { base_stat: 49, effort: 0, stat: { name: "attack" } },
      ],
      types: [
        { slot: 1, type: { name: "grass" } },
        { slot: 2, type: { name: "poison" } },
      ],
      species: { name: "bulbasaur", url: "https://pokeapi.co/api/v2/pokemon-species/1/" },
    }),
  });

  const result = await repository.findByName("bulbasaur");

  expect(result).toBeInstanceOf(PokemonDetail);
  expect(result.name).toBe("bulbasaur");
  expect(result.height).toBe(7);
  expect(result.stats).toHaveLength(2);
  expect(result.types).toEqual(["grass", "poison"]);
  expect(mockFetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon/bulbasaur");
});

it("finds evolution chain URL from species URL", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      evolution_chain: { url: "https://pokeapi.co/api/v2/evolution-chain/1/" },
    }),
  });

  const result = await repository.findEvolutionChainUrl(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );

  expect(result).toBe("https://pokeapi.co/api/v2/evolution-chain/1/");
  expect(mockFetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/pokemon-species/1/");
});

it("finds evolution chain and returns domain entity with all pokemon names", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      chain: {
        species: { name: "bulbasaur", url: "" },
        evolves_to: [
          {
            species: { name: "ivysaur", url: "" },
            evolves_to: [
              {
                species: { name: "venusaur", url: "" },
                evolves_to: [],
              },
            ],
          },
        ],
      },
    }),
  });

  const result = await repository.findEvolutionChain(
    "https://pokeapi.co/api/v2/evolution-chain/1/"
  );

  expect(result).toBeInstanceOf(EvolutionChain);
  expect(result.pokemonNames).toEqual(["bulbasaur", "ivysaur", "venusaur"]);
});

it("handles pokemon with no evolutions", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      chain: {
        species: { name: "ditto", url: "" },
        evolves_to: [],
      },
    }),
  });

  const result = await repository.findEvolutionChain(
    "https://pokeapi.co/api/v2/evolution-chain/66/"
  );

  expect(result.pokemonNames).toEqual(["ditto"]);
});

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/http/__tests__/HttpPokemonDetailRepository.test.ts
Tests must FAIL because HttpPokemonDetailRepository doesn't exist yet (RED phase).
```

---

### **2.3 Implement HttpPokemonDetailRepository (GREEN) - Core methods only**

### **Prompt for the agent:**

```
Implement HttpPokemonDetailRepository with core methods. findAllByType will be added in Phase 8.

FILE: src/features/pokemon-detail/infrastructure/http/HttpPokemonDetailRepository.ts

CONTENT:
import { PokemonDetail } from "../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../domain/entities/EvolutionChain";
import { PokemonStat } from "../../domain/value-objects/PokemonStat";
import { PokemonByType } from "../../domain/value-objects/PokemonByType";
import { PokemonDetailRepository } from "../../domain/ports/PokemonDetailRepository";
import {
  PokemonDetailResponse,
  EvolutionChainResponse,
  EvolutionChainLink,
  SpeciesResponse,
  PokemonByTypeResponse,
} from "./dto";

interface HttpPokemonDetailRepositoryConfig {
  pokemonEndpoint: string;
  typeEndpoint: string;
}

export class HttpPokemonDetailRepository implements PokemonDetailRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly config: HttpPokemonDetailRepositoryConfig
  ) {}

  async findByName(name: string): Promise<PokemonDetail> {
    const response = await fetch(
      `${this.baseUrl}${this.config.pokemonEndpoint}${name}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon: ${name}`);
    }

    const data: PokemonDetailResponse = await response.json();

    return new PokemonDetail(
      data.id,
      data.name,
      data.height,
      data.weight,
      data.sprites.front_default,
      data.stats.map(
        (stat) => new PokemonStat(stat.stat.name, stat.base_stat, stat.effort)
      ),
      data.types.map((type) => type.type.name),
      data.species.url
    );
  }

  async findEvolutionChainUrl(speciesUrl: string): Promise<string> {
    const response = await fetch(speciesUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch species: ${speciesUrl}`);
    }

    const data: SpeciesResponse = await response.json();
    return data.evolution_chain.url;
  }

  async findEvolutionChain(evolutionChainUrl: string): Promise<EvolutionChain> {
    const response = await fetch(evolutionChainUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch evolution chain: ${evolutionChainUrl}`);
    }

    const data: EvolutionChainResponse = await response.json();
    const pokemonNames = this.parseEvolutionChain(data.chain);

    return new EvolutionChain(pokemonNames);
  }

  async findAllByType(typeName: string): Promise<PokemonByType[]> {
    const response = await fetch(
      `${this.baseUrl}${this.config.typeEndpoint}${typeName}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon by type: ${typeName}`);
    }

    const data: PokemonByTypeResponse = await response.json();

    return data.pokemon.map(
      (slot) => new PokemonByType(slot.pokemon.name)
    );
  }

  private parseEvolutionChain(chain: EvolutionChainLink): string[] {
    const names: string[] = [chain.species.name];

    for (const evolution of chain.evolves_to) {
      names.push(...this.parseEvolutionChain(evolution));
    }

    return names;
  }
}

NOTE: Build will fail until PokemonByType is created in Phase 7. Tests for core methods should pass.

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/http/__tests__/HttpPokemonDetailRepository.test.ts
All 4 core tests must PASS (GREEN phase).
```

---

## ✅ PHASE 3: Application Layer (Use Cases - Core)

### **3.1 Create GetPokemonDetailUseCase - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for GetPokemonDetailUseCase.

FILE: src/features/pokemon-detail/application/use-cases/get-pokemon-detail/__tests__/GetPokemonDetailUseCase.test.ts

CONTENT:
import { it, expect, vi } from "vitest";
import { GetPokemonDetailUseCase } from "../GetPokemonDetailUseCase";
import { PokemonDetail } from "../../../../domain/entities/PokemonDetail";
import { PokemonDetailRepository } from "../../../../domain/ports/PokemonDetailRepository";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

const mockPokemonDetail = new PokemonDetail(
  1,
  "bulbasaur",
  7,
  69,
  "https://sprite.png",
  [],
  ["grass", "poison"],
  "https://pokeapi.co/api/v2/pokemon-species/1/"
);

it("executes and returns pokemon detail from repository", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findByName as ReturnType<typeof vi.fn>).mockResolvedValue(mockPokemonDetail);

  const useCase = new GetPokemonDetailUseCase(mockRepository);
  const result = await useCase.execute("bulbasaur");

  expect(result).toBe(mockPokemonDetail);
  expect(mockRepository.findByName).toHaveBeenCalledWith("bulbasaur");
});

it("throws error when pokemon name is empty", async () => {
  const mockRepository = createMockRepository();
  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("")).rejects.toThrow("Pokemon name is required");
});

it("throws error when pokemon name is only whitespace", async () => {
  const mockRepository = createMockRepository();
  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("   ")).rejects.toThrow("Pokemon name is required");
});

it("propagates repository errors", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findByName as ReturnType<typeof vi.fn>).mockRejectedValue(
    new Error("Network error")
  );

  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("bulbasaur")).rejects.toThrow("Network error");
});

VERIFICATION:
npm test src/features/pokemon-detail/application/use-cases/get-pokemon-detail/__tests__/GetPokemonDetailUseCase.test.ts
Tests must FAIL (RED).
```

---

### **3.2 Implement GetPokemonDetailUseCase (GREEN)**

### **Prompt for the agent:**

```
Implement GetPokemonDetailUseCase so tests pass.

FILE: src/features/pokemon-detail/application/use-cases/get-pokemon-detail/GetPokemonDetailUseCase.ts

CONTENT:
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

export class GetPokemonDetailUseCase {
  constructor(private readonly repository: PokemonDetailRepository) {}

  async execute(name: string): Promise<PokemonDetail> {
    if (!name || name.trim() === "") {
      throw new Error("Pokemon name is required");
    }

    return await this.repository.findByName(name.toLowerCase());
  }
}

VERIFICATION:
npm test src/features/pokemon-detail/application/use-cases/get-pokemon-detail/__tests__/GetPokemonDetailUseCase.test.ts
All tests must PASS (GREEN).
```

---

### **3.3 Create GetEvolutionChainUseCase - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for GetEvolutionChainUseCase.

FILE: src/features/pokemon-detail/application/use-cases/get-evolution-chain/__tests__/GetEvolutionChainUseCase.test.ts

CONTENT:
import { it, expect, vi } from "vitest";
import { GetEvolutionChainUseCase } from "../GetEvolutionChainUseCase";
import { EvolutionChain } from "../../../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../../../domain/ports/PokemonDetailRepository";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

it("executes and returns evolution chain from species URL", async () => {
  const mockRepository = createMockRepository();
  const mockChain = new EvolutionChain(["bulbasaur", "ivysaur", "venusaur"]);

  (mockRepository.findEvolutionChainUrl as ReturnType<typeof vi.fn>).mockResolvedValue(
    "https://pokeapi.co/api/v2/evolution-chain/1/"
  );
  (mockRepository.findEvolutionChain as ReturnType<typeof vi.fn>).mockResolvedValue(mockChain);

  const useCase = new GetEvolutionChainUseCase(mockRepository);
  const result = await useCase.execute("https://pokeapi.co/api/v2/pokemon-species/1/");

  expect(result).toBe(mockChain);
  expect(mockRepository.findEvolutionChainUrl).toHaveBeenCalledWith(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );
  expect(mockRepository.findEvolutionChain).toHaveBeenCalledWith(
    "https://pokeapi.co/api/v2/evolution-chain/1/"
  );
});

it("returns null when speciesUrl is empty", async () => {
  const mockRepository = createMockRepository();
  const useCase = new GetEvolutionChainUseCase(mockRepository);

  const result = await useCase.execute("");

  expect(result).toBeNull();
  expect(mockRepository.findEvolutionChainUrl).not.toHaveBeenCalled();
});

it("returns null when speciesUrl is null", async () => {
  const mockRepository = createMockRepository();
  const useCase = new GetEvolutionChainUseCase(mockRepository);

  const result = await useCase.execute(null as unknown as string);

  expect(result).toBeNull();
});

it("propagates repository errors", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findEvolutionChainUrl as ReturnType<typeof vi.fn>).mockRejectedValue(
    new Error("Network error")
  );

  const useCase = new GetEvolutionChainUseCase(mockRepository);

  await expect(
    useCase.execute("https://pokeapi.co/api/v2/pokemon-species/1/")
  ).rejects.toThrow("Network error");
});

VERIFICATION:
npm test src/features/pokemon-detail/application/use-cases/get-evolution-chain/__tests__/GetEvolutionChainUseCase.test.ts
Tests must FAIL (RED).
```

---

### **3.4 Implement GetEvolutionChainUseCase (GREEN)**

### **Prompt for the agent:**

```
Implement GetEvolutionChainUseCase so tests pass.

FILE: src/features/pokemon-detail/application/use-cases/get-evolution-chain/GetEvolutionChainUseCase.ts

CONTENT:
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

export class GetEvolutionChainUseCase {
  constructor(private readonly repository: PokemonDetailRepository) {}

  async execute(speciesUrl: string | null): Promise<EvolutionChain | null> {
    if (!speciesUrl || speciesUrl.trim() === "") {
      return null;
    }

    const evolutionChainUrl = await this.repository.findEvolutionChainUrl(speciesUrl);
    return await this.repository.findEvolutionChain(evolutionChainUrl);
  }
}

VERIFICATION:
npm test src/features/pokemon-detail/application/use-cases/get-evolution-chain/__tests__/GetEvolutionChainUseCase.test.ts
All tests must PASS (GREEN).
```

---

## ✅ PHASE 4: Application Layer (ViewModel - Core)

### **4.1 Create PokemonDetailViewModel - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for PokemonDetailViewModel.

FILE: src/features/pokemon-detail/application/view-models/__tests__/PokemonDetailViewModel.test.ts

CONTENT:
import { it, expect, vi } from "vitest";
import { PokemonDetailViewModel } from "../PokemonDetailViewModel";
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

const mockPokemonDetail = new PokemonDetail(
  1,
  "bulbasaur",
  7,
  69,
  "https://sprite.png",
  [],
  ["grass", "poison"],
  "https://pokeapi.co/api/v2/pokemon-species/1/"
);

const mockEvolutionChain = new EvolutionChain(["bulbasaur", "ivysaur", "venusaur"]);

it("loads pokemon detail by name", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findByName as ReturnType<typeof vi.fn>).mockResolvedValue(mockPokemonDetail);

  const viewModel = new PokemonDetailViewModel(mockRepository);
  const result = await viewModel.loadPokemonDetail("bulbasaur");

  expect(result).toBe(mockPokemonDetail);
});

it("returns null when name is empty", async () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = await viewModel.loadPokemonDetail("");

  expect(result).toBeNull();
  expect(mockRepository.findByName).not.toHaveBeenCalled();
});

it("loads evolution chain from species URL", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findEvolutionChainUrl as ReturnType<typeof vi.fn>).mockResolvedValue(
    "https://pokeapi.co/api/v2/evolution-chain/1/"
  );
  (mockRepository.findEvolutionChain as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockEvolutionChain
  );

  const viewModel = new PokemonDetailViewModel(mockRepository);
  const result = await viewModel.loadEvolutionChain(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );

  expect(result).toBe(mockEvolutionChain);
});

it("returns null evolution chain when species URL is empty", async () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = await viewModel.loadEvolutionChain("");

  expect(result).toBeNull();
});

it("gets evolutions excluding current pokemon", () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = viewModel.getEvolutionsExcluding(mockEvolutionChain, "bulbasaur");

  expect(result).toEqual(["ivysaur", "venusaur"]);
});

it("returns empty array when evolution chain is null", () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonDetailViewModel(mockRepository);

  const result = viewModel.getEvolutionsExcluding(null, "bulbasaur");

  expect(result).toEqual([]);
});

VERIFICATION:
npm test src/features/pokemon-detail/application/view-models/__tests__/PokemonDetailViewModel.test.ts
Tests must FAIL (RED).
```

---

### **4.2 Implement PokemonDetailViewModel (GREEN)**

### **Prompt for the agent:**

```
Implement PokemonDetailViewModel so tests pass.

FILE: src/features/pokemon-detail/application/view-models/PokemonDetailViewModel.ts

CONTENT:
import { PokemonDetail } from "../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../domain/ports/PokemonDetailRepository";
import { GetPokemonDetailUseCase } from "../use-cases/get-pokemon-detail/GetPokemonDetailUseCase";
import { GetEvolutionChainUseCase } from "../use-cases/get-evolution-chain/GetEvolutionChainUseCase";

export class PokemonDetailViewModel {
  private readonly getPokemonDetailUseCase: GetPokemonDetailUseCase;
  private readonly getEvolutionChainUseCase: GetEvolutionChainUseCase;

  constructor(repository: PokemonDetailRepository) {
    this.getPokemonDetailUseCase = new GetPokemonDetailUseCase(repository);
    this.getEvolutionChainUseCase = new GetEvolutionChainUseCase(repository);
  }

  async loadPokemonDetail(name: string): Promise<PokemonDetail | null> {
    if (!name || name.trim() === "") {
      return null;
    }
    return await this.getPokemonDetailUseCase.execute(name);
  }

  async loadEvolutionChain(speciesUrl: string): Promise<EvolutionChain | null> {
    return await this.getEvolutionChainUseCase.execute(speciesUrl);
  }

  getEvolutionsExcluding(chain: EvolutionChain | null, currentName: string): string[] {
    if (!chain) {
      return [];
    }
    return chain.getEvolutionsExcluding(currentName);
  }
}

VERIFICATION:
npm test src/features/pokemon-detail/application/view-models/__tests__/PokemonDetailViewModel.test.ts
All tests must PASS (GREEN).
```

---

## ✅ PHASE 5: Infrastructure Layer (React Hook - Core)

### **5.1 Create centralized mocks**

### **Prompt for the agent:**

```
Create the centralized mocks file for the pokemon-detail feature.

FILE: src/features/pokemon-detail/__tests__/mocks.ts

CONTENT:
import { vi } from "vitest";
import { PokemonDetail } from "../domain/entities/PokemonDetail";
import { EvolutionChain } from "../domain/entities/EvolutionChain";
import { PokemonStat } from "../domain/value-objects/PokemonStat";
import { PokemonByType } from "../domain/value-objects/PokemonByType";
import { PokemonDetailRepository } from "../domain/ports/PokemonDetailRepository";

export const mockBulbasaurStats: PokemonStat[] = [
  new PokemonStat("hp", 45, 0),
  new PokemonStat("attack", 49, 0),
  new PokemonStat("defense", 49, 0),
  new PokemonStat("special-attack", 65, 1),
  new PokemonStat("special-defense", 65, 0),
  new PokemonStat("speed", 45, 0),
];

export const mockBulbasaurDetail = new PokemonDetail(
  1,
  "bulbasaur",
  7,
  69,
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png",
  mockBulbasaurStats,
  ["grass", "poison"],
  "https://pokeapi.co/api/v2/pokemon-species/1/"
);

export const mockBulbasaurEvolutionChain = new EvolutionChain([
  "bulbasaur",
  "ivysaur",
  "venusaur",
]);

export const mockGrassPokemonList: PokemonByType[] = [
  new PokemonByType("bulbasaur"),
  new PokemonByType("ivysaur"),
  new PokemonByType("venusaur"),
  new PokemonByType("oddish"),
];

export const createMockPokemonDetailRepository = (
  detail: PokemonDetail = mockBulbasaurDetail,
  evolutionChain: EvolutionChain = mockBulbasaurEvolutionChain,
  pokemonByType: PokemonByType[] = mockGrassPokemonList
): PokemonDetailRepository => ({
  findByName: vi.fn().mockResolvedValue(detail),
  findEvolutionChainUrl: vi.fn().mockResolvedValue("https://pokeapi.co/api/v2/evolution-chain/1/"),
  findEvolutionChain: vi.fn().mockResolvedValue(evolutionChain),
  findAllByType: vi.fn().mockResolvedValue(pokemonByType),
});

export const createMockPokemonDetailRepositoryWithError = (
  error: Error
): PokemonDetailRepository => ({
  findByName: vi.fn().mockRejectedValue(error),
  findEvolutionChainUrl: vi.fn().mockRejectedValue(error),
  findEvolutionChain: vi.fn().mockRejectedValue(error),
  findAllByType: vi.fn().mockRejectedValue(error),
});

NOTE: Build will fail until PokemonByType is created in Phase 7.

VERIFICATION:
File created without syntax errors.
```

---

### **5.2 Create usePokemonDetail - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for usePokemonDetail hook.

FILE: src/features/pokemon-detail/infrastructure/react/hooks/__tests__/usePokemonDetail.test.ts

CONTENT:
import { renderHook, waitFor } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonDetail from "../usePokemonDetail";
import {
  mockBulbasaurDetail,
  mockBulbasaurEvolutionChain,
  createMockPokemonDetailRepository,
  createMockPokemonDetailRepositoryWithError,
} from "../../../../__tests__/mocks";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

it("returns pokemon detail when name is provided", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.pokemonDetail).toEqual(mockBulbasaurDetail);
  });
});

it("returns evolution chain after loading pokemon detail", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.evolutionChain).toEqual(mockBulbasaurEvolutionChain);
  });
});

it("returns evolutions excluding current pokemon", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.evolutions).toEqual(["ivysaur", "venusaur"]);
  });
});

it("returns isLoading true while fetching", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it("returns isError true when fetch fails", async () => {
  const mockRepository = createMockPokemonDetailRepositoryWithError(new Error("API Error"));

  const { result } = renderHook(() => usePokemonDetail("bulbasaur", mockRepository));

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
});

it("returns null values when name is empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonDetail("", mockRepository));

  expect(result.current.pokemonDetail).toBeNull();
  expect(result.current.evolutionChain).toBeNull();
  expect(result.current.evolutions).toEqual([]);
  expect(result.current.isLoading).toBe(false);
});

it("clears previous data when name changes to empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result, rerender } = renderHook(
    ({ name }) => usePokemonDetail(name, mockRepository),
    { initialProps: { name: "bulbasaur" } }
  );

  await waitFor(() => {
    expect(result.current.pokemonDetail).toEqual(mockBulbasaurDetail);
  });

  rerender({ name: "" });

  expect(result.current.pokemonDetail).toBeNull();
  expect(result.current.evolutions).toEqual([]);
});

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/react/hooks/__tests__/usePokemonDetail.test.ts
Tests must FAIL (RED).
```

---

### **5.3 Implement usePokemonDetail (GREEN)**

### **Prompt for the agent:**

```
Implement usePokemonDetail hook with the overload pattern for DI.

FILE: src/features/pokemon-detail/infrastructure/react/hooks/usePokemonDetail.ts

CONTENT:
import { useState, useEffect, useMemo } from "react";
import { PokemonDetail } from "../../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";
import { PokemonDetailViewModel } from "../../../application/view-models/PokemonDetailViewModel";
import { HttpPokemonDetailRepository } from "../../http/HttpPokemonDetailRepository";

interface UsePokemonDetailResult {
  pokemonDetail: PokemonDetail | null;
  evolutionChain: EvolutionChain | null;
  evolutions: string[];
  isLoading: boolean;
  isError: boolean;
}

function usePokemonDetail(name: string): UsePokemonDetailResult;
function usePokemonDetail(name: string, repository: PokemonDetailRepository): UsePokemonDetailResult;
function usePokemonDetail(
  name: string,
  repository?: PokemonDetailRepository
): UsePokemonDetailResult {
  const [pokemonDetail, setPokemonDetail] = useState<PokemonDetail | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const isRepositoryInjected = repository !== undefined;

  const repositoryInstance = useMemo(() => {
    if (isRepositoryInjected) {
      return repository;
    }
    return new HttpPokemonDetailRepository("https://pokeapi.co/api/v2/", {
      pokemonEndpoint: "pokemon/",
      typeEndpoint: "type/",
    });
  }, [isRepositoryInjected, repository]);

  const viewModel = useMemo(
    () => new PokemonDetailViewModel(repositoryInstance),
    [repositoryInstance]
  );

  useEffect(() => {
    if (!name) {
      setPokemonDetail(null);
      setEvolutionChain(null);
      setIsLoading(false);
      setIsError(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        const detail = await viewModel.loadPokemonDetail(name);
        setPokemonDetail(detail);

        if (detail?.speciesUrl) {
          const chain = await viewModel.loadEvolutionChain(detail.speciesUrl);
          setEvolutionChain(chain);
        }
      } catch (error) {
        console.error("Error fetching pokemon detail:", error);
        setPokemonDetail(null);
        setEvolutionChain(null);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [name, viewModel]);

  const evolutions = useMemo(() => {
    if (!evolutionChain || !pokemonDetail) {
      return [];
    }
    return viewModel.getEvolutionsExcluding(evolutionChain, pokemonDetail.name);
  }, [evolutionChain, pokemonDetail, viewModel]);

  return {
    pokemonDetail,
    evolutionChain,
    evolutions,
    isLoading,
    isError,
  };
}

export default usePokemonDetail;

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/react/hooks/__tests__/usePokemonDetail.test.ts
All tests must PASS (GREEN).
```

---

## ✅ PHASE 6: UI Layer (Core Components)

### **6.1 Create PokemonEvolutions.tsx in ui/**

### **Prompt for the agent:**

```
Create PokemonEvolutions.tsx as a pure presentational component.

FILE: src/features/pokemon-detail/ui/PokemonEvolutions.tsx

CONTENT:
import { Link } from "react-router-dom";
import { paths } from "../../../lib/constants";

interface PokemonEvolutionsProps {
  evolutions: string[];
}

const PokemonEvolutions = ({ evolutions }: PokemonEvolutionsProps) => {
  if (evolutions.length === 0) {
    return null;
  }

  return (
    <>
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Evolutions:
      </h2>
      <ul aria-live="polite" className="inline-flex gap-4 mb-4">
        {evolutions.map((evolution) => (
          <li
            key={evolution}
            className="capitalize bg-stone-200 rounded-lg p-2"
          >
            <Link
              className="text-blue-500 hover:underline"
              to={`${paths.BASE}${evolution}`}
            >
              {evolution}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};

export default PokemonEvolutions;

VERIFICATION:
npm run build must pass.
```

---

### **6.2 Create useStatsGraph hook in infrastructure layer (WITH tests)**

### **Important Architectural Decision:**

`useStatsGraph` is a **visualization adapter** (not a UI layer hook). It bridges D3 (third-party library) with React's effects and translates domain objects into visualization configuration.

**CRITICAL PRINCIPLE: Infrastructure adapters consume domain language directly.**

The adapter's job is to translate **FROM** domain objects **TO** external libraries (D3), never the other way around. This means the hook accepts `PokemonStat[]` (domain) and internally converts it to what D3 needs. This keeps the UI component truly humble with ZERO transformation logic.

### **Prompt for the agent:**

```
Create useStatsGraph.tsx in the infrastructure hooks folder with comprehensive tests.

FILE: src/features/pokemon-detail/infrastructure/react/hooks/useStatsGraph.tsx

CONTENT:
import { useEffect } from "react";
import * as d3 from "d3";
import { graphConfig } from "../../../../../lib/constants";
import { PokemonStat } from "../../../domain/value-objects/PokemonStat";

export const useStatsGraph = (
  ref: React.RefObject<SVGSVGElement | null>,
  stats: PokemonStat[]
) => {
  useEffect(() => {
    if (!ref.current) return;
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const innerWidth = graphConfig.WIDTH;
    const innerHeight = graphConfig.HEIGHT;
    const margin = {
      top: graphConfig.MARGIN_TOP,
      right: graphConfig.MARGIN_RIGHT,
      bottom: graphConfig.MARGIN_BOTTOM,
      left: graphConfig.MARGIN_LEFT,
    };

    const chartWidth = innerWidth - margin.left - margin.right;
    const chartHeight = innerHeight - margin.top - margin.bottom;

    const y = d3
      .scaleBand()
      .domain(stats.map((d) => d.name))
      .range([0, chartHeight])
      .padding(0.3);

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(stats, (d) => d.baseStat)!])
      .nice()
      .range([0, chartWidth]);

    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chartGroup
      .selectAll("rect")
      .data(stats)
      .join("rect")
      .attr("y", (d) => y(d.name)!)
      .attr("x", 0)
      .attr("height", y.bandwidth())
      .attr("width", 0)
      .attr("fill", "#60a5fa")
      .transition()
      .duration(800)
      .attr("width", (d) => x(d.baseStat));

    chartGroup
      .append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(x).ticks(5));

    chartGroup
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", "0.85rem")
      .style("text-transform", "capitalize");
  }, [ref, stats]);
};

IMPORTANT: Tests must verify OUR logic (scale configuration, animation timing, domain calculations), not D3 library behavior.

TEST FILE: src/features/pokemon-detail/infrastructure/react/hooks/__tests__/useStatsGraph.test.ts

Key test scenarios (verify our implementation decisions):
- Stat names extracted and passed to scaleBand domain correctly
- d3.max called with accessor that extracts base_stat
- scaleLinear domain set as [0, maxStatValue]
- scaleBand configured with 0.3 padding
- Transition with 800ms duration applied
- Previous chart content cleared before rendering
- Hook handles null ref without calling d3
- Hook re-executes when stats array changes
- Correct behavior with extreme stat values (1-255)

VERIFICATION:
npm run build must pass.
npm test src/features/pokemon-detail/infrastructure/react/hooks/__tests__/useStatsGraph.test.ts
All tests must verify our logic, not blackbox testing.
```

---

### **6.3 Create PokemonStats.tsx in ui/**

### **Prompt for the agent:**

```
Create PokemonStats.tsx in the ui folder as a humble component.

FILE: src/features/pokemon-detail/ui/PokemonStats.tsx

CONTENT:
import { useRef } from "react";
import { PokemonStat } from "../domain/value-objects/PokemonStat";
import { useStatsGraph } from "../infrastructure/react/hooks/useStatsGraph";

interface PokemonStatsProps {
  stats: PokemonStat[];
}

const PokemonStats = ({ stats }: PokemonStatsProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useStatsGraph(svgRef, stats);

  return (
    <>
      <h2 className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold">
        Stats:
      </h2>
      <div className="w-full lg:w-2/3 xl:w-1/2 bg-stone-200 rounded-lg p-4 mb-4 text-stone-800">
        <svg
          ref={svgRef}
          viewBox="0 0 500 300"
          preserveAspectRatio="xMinYMin meet"
          className="w-full h-auto rounded"
        />
      </div>
    </>
  );
};

export default PokemonStats;

### **Important Architectural Principle:**

This component demonstrates the **humble component pattern** at its finest. Notice what's NOT here:

- ❌ No data transformation (`statsForGraph` mapping)
- ❌ No D3-specific data structures
- ❌ No business logic

The component receives `PokemonStat[]` (domain language) and passes it DIRECTLY to the hook. The hook (`useStatsGraph`) is the **visualization adapter** that handles the translation from domain objects to D3 library structures.

**WHY THIS MATTERS:**

Infrastructure adapters (like D3 hooks) consume domain language directly. The adapter's job is to translate **FROM** domain objects **TO** external libraries, never the other way around. This keeps UI components truly humble with zero transformation logic.

VERIFICATION:
npm run build must pass.
```

---

### **6.4 Create PokemonDetail.tsx in ui/ (partial - without PokemonDetailTypes for now)**

### **Prompt for the agent:**

```
Create the main PokemonDetail.tsx component in ui/.

NOTE: PokemonDetailTypes integration will be added in Phase 12 after its hexagonal refactor.

FILE: src/features/pokemon-detail/ui/PokemonDetail.tsx

CONTENT:
import usePokemonDetail from "../infrastructure/react/hooks/usePokemonDetail";
import PokemonEvolutions from "./PokemonEvolutions";
import PokemonStats from "./PokemonStats";

interface PokemonDetailProps {
  name: string;
}

const PokemonDetail = ({ name }: PokemonDetailProps) => {
  const { pokemonDetail, evolutions, isLoading, isError } = usePokemonDetail(name);

  if (isLoading) {
    return <p>Loading pokemon details...</p>;
  }

  if (isError) {
    return <p>Error loading pokemon details</p>;
  }

  if (!pokemonDetail) {
    return null;
  }

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row bg-stone-600 rounded-lg p-4 mb-4">
        <img
          className="w-full md:w-80 xl:w-86 object-contain"
          src={pokemonDetail.imageUrl}
          alt={pokemonDetail.name}
        />
        <div className="w-full">
          {evolutions.length > 0 && (
            <PokemonEvolutions evolutions={evolutions} />
          )}
          {pokemonDetail.stats.length > 0 && (
            <PokemonStats stats={pokemonDetail.stats} />
          )}
        </div>
      </section>

      {/* PokemonDetailTypes will be added after Phase 12 */}
    </>
  );
};

export default PokemonDetail;

VERIFICATION:
npm run build must pass.
```

---

## ✅ PHASE 7: Domain Layer (PokemonsByType)

### **7.1 Create Value Object: PokemonByType (Data Container - NO tests)**

### **Prompt for the agent:**

```
Create the PokemonByType Value Object.

FILE: src/features/pokemon-detail/domain/value-objects/PokemonByType.ts

CONTENT:
export class PokemonByType {
  constructor(public readonly name: string) {}
}

IMPORTANT: This is a DATA CONTAINER without behavior. DO NOT create tests (YAGNI).

VERIFICATION:
npm run build must pass.
Update the index.ts in value-objects to export PokemonByType if not already done.
```

---

## ✅ PHASE 8: Infrastructure - Repository Extension

### **8.1 Add tests for findAllByType (RED → GREEN)**

### **Prompt for the agent:**

```
Add tests for findAllByType to the existing repository tests.

FILE: src/features/pokemon-detail/infrastructure/http/__tests__/HttpPokemonDetailRepository.test.ts

ADD these tests at the end of the file:

it("finds all pokemon by type", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      pokemon: [
        { pokemon: { name: "bulbasaur", url: "..." }, slot: 1 },
        { pokemon: { name: "ivysaur", url: "..." }, slot: 2 },
      ],
    }),
  });

  const result = await repository.findAllByType("grass");

  expect(result).toHaveLength(2);
  expect(result[0].name).toBe("bulbasaur");
  expect(result[1].name).toBe("ivysaur");
  expect(mockFetch).toHaveBeenCalledWith("https://pokeapi.co/api/v2/type/grass");
});

it("returns empty array when type has no pokemon", async () => {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      pokemon: [],
    }),
  });

  const result = await repository.findAllByType("unknown");

  expect(result).toEqual([]);
});

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/http/__tests__/HttpPokemonDetailRepository.test.ts
All 6 tests must PASS.
```

---

## ✅ PHASE 9: Application - GetPokemonsByTypeUseCase

### **9.1 Create GetPokemonsByTypeUseCase - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for GetPokemonsByTypeUseCase.

FILE: src/features/pokemon-detail/application/use-cases/get-pokemons-by-type/__tests__/GetPokemonsByTypeUseCase.test.ts

CONTENT:
import { it, expect, vi } from "vitest";
import { GetPokemonsByTypeUseCase } from "../GetPokemonsByTypeUseCase";
import { PokemonByType } from "../../../../domain/value-objects/PokemonByType";
import { PokemonDetailRepository } from "../../../../domain/ports/PokemonDetailRepository";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

it("returns pokemon list for a type", async () => {
  const mockRepository = createMockRepository();
  const mockPokemonList = [
    new PokemonByType("bulbasaur"),
    new PokemonByType("ivysaur"),
  ];
  (mockRepository.findAllByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockPokemonList);

  const useCase = new GetPokemonsByTypeUseCase(mockRepository);
  const result = await useCase.execute("grass");

  expect(result).toBe(mockPokemonList);
  expect(mockRepository.findAllByType).toHaveBeenCalledWith("grass");
});

it("throws error when type name is empty", async () => {
  const mockRepository = createMockRepository();
  const useCase = new GetPokemonsByTypeUseCase(mockRepository);

  await expect(useCase.execute("")).rejects.toThrow("Type name is required");
});

it("propagates repository errors", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findAllByType as ReturnType<typeof vi.fn>).mockRejectedValue(
    new Error("Network error")
  );

  const useCase = new GetPokemonsByTypeUseCase(mockRepository);

  await expect(useCase.execute("grass")).rejects.toThrow("Network error");
});

VERIFICATION:
npm test src/features/pokemon-detail/application/use-cases/get-pokemons-by-type/__tests__/GetPokemonsByTypeUseCase.test.ts
Tests must FAIL (RED).
```

---

### **9.2 Implement GetPokemonsByTypeUseCase (GREEN)**

### **Prompt for the agent:**

```
Implement GetPokemonsByTypeUseCase.

FILE: src/features/pokemon-detail/application/use-cases/get-pokemons-by-type/GetPokemonsByTypeUseCase.ts

CONTENT:
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

export class GetPokemonsByTypeUseCase {
  constructor(private readonly repository: PokemonDetailRepository) {}

  async execute(typeName: string): Promise<PokemonByType[]> {
    if (!typeName || typeName.trim() === "") {
      throw new Error("Type name is required");
    }

    return await this.repository.findAllByType(typeName.toLowerCase());
  }
}

VERIFICATION:
npm test src/features/pokemon-detail/application/use-cases/get-pokemons-by-type/__tests__/GetPokemonsByTypeUseCase.test.ts
All tests must PASS (GREEN).
```

---

## ✅ PHASE 10: Application - PokemonsByTypeViewModel

### **10.1 Create PokemonsByTypeViewModel - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for PokemonsByTypeViewModel.

FILE: src/features/pokemon-detail/application/view-models/__tests__/PokemonsByTypeViewModel.test.ts

CONTENT:
import { it, expect, vi } from "vitest";
import { PokemonsByTypeViewModel } from "../PokemonsByTypeViewModel";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

it("loads pokemon list by type", async () => {
  const mockRepository = createMockRepository();
  const mockPokemonList = [
    new PokemonByType("bulbasaur"),
    new PokemonByType("ivysaur"),
  ];
  (mockRepository.findAllByType as ReturnType<typeof vi.fn>).mockResolvedValue(mockPokemonList);

  const viewModel = new PokemonsByTypeViewModel(mockRepository);
  const result = await viewModel.loadPokemonsByType("grass");

  expect(result).toBe(mockPokemonList);
});

it("returns empty array when type is empty", async () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonsByTypeViewModel(mockRepository);

  const result = await viewModel.loadPokemonsByType("");

  expect(result).toEqual([]);
  expect(mockRepository.findAllByType).not.toHaveBeenCalled();
});

it("returns empty array when type is null", async () => {
  const mockRepository = createMockRepository();
  const viewModel = new PokemonsByTypeViewModel(mockRepository);

  const result = await viewModel.loadPokemonsByType(null as unknown as string);

  expect(result).toEqual([]);
});

it("extracts pokemon names from list", () => {
  const mockRepository = createMockRepository();
  const pokemonList = [
    new PokemonByType("bulbasaur"),
    new PokemonByType("ivysaur"),
  ];

  const viewModel = new PokemonsByTypeViewModel(mockRepository);
  const result = viewModel.getPokemonNames(pokemonList);

  expect(result).toEqual(["bulbasaur", "ivysaur"]);
});

VERIFICATION:
npm test src/features/pokemon-detail/application/view-models/__tests__/PokemonsByTypeViewModel.test.ts
Tests must FAIL (RED).
```

---

### **10.2 Implement PokemonsByTypeViewModel (GREEN)**

### **Prompt for the agent:**

```
Implement PokemonsByTypeViewModel.

FILE: src/features/pokemon-detail/application/view-models/PokemonsByTypeViewModel.ts

CONTENT:
import { PokemonByType } from "../../domain/value-objects/PokemonByType";
import { PokemonDetailRepository } from "../../domain/ports/PokemonDetailRepository";
import { GetPokemonsByTypeUseCase } from "../use-cases/get-pokemons-by-type/GetPokemonsByTypeUseCase";

export class PokemonsByTypeViewModel {
  private readonly getPokemonsByTypeUseCase: GetPokemonsByTypeUseCase;

  constructor(repository: PokemonDetailRepository) {
    this.getPokemonsByTypeUseCase = new GetPokemonsByTypeUseCase(repository);
  }

  async loadPokemonsByType(typeName: string | null): Promise<PokemonByType[]> {
    if (!typeName || typeName.trim() === "") {
      return [];
    }
    return await this.getPokemonsByTypeUseCase.execute(typeName);
  }

  getPokemonNames(pokemonList: PokemonByType[]): string[] {
    return pokemonList.map((pokemon) => pokemon.name);
  }
}

VERIFICATION:
npm test src/features/pokemon-detail/application/view-models/__tests__/PokemonsByTypeViewModel.test.ts
All tests must PASS (GREEN).
```

---

## ✅ PHASE 11: Infrastructure - usePokemonsByType Hook

### **11.1 Create usePokemonsByType - Tests first (RED)**

### **Prompt for the agent:**

```
Create tests for usePokemonsByType hook.

FILE: src/features/pokemon-detail/infrastructure/react/hooks/__tests__/usePokemonsByType.test.ts

CONTENT:
import { renderHook, waitFor, act } from "@testing-library/react";
import { vi, it, expect, beforeEach } from "vitest";
import usePokemonsByType from "../usePokemonsByType";
import {
  mockGrassPokemonList,
  createMockPokemonDetailRepository,
  createMockPokemonDetailRepositoryWithError,
} from "../../../../__tests__/mocks";

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
});

it("returns empty pokemon list initially", () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  expect(result.current.pokemonNames).toEqual([]);
  expect(result.current.selectedType).toBeNull();
  expect(result.current.isLoading).toBe(false);
});

it("loads pokemon list when selectType is called", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("grass");
  });

  await waitFor(() => {
    expect(result.current.pokemonNames).toEqual(["bulbasaur", "ivysaur", "venusaur", "oddish"]);
  });
});

it("updates selectedType when selectType is called", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("fire");
  });

  expect(result.current.selectedType).toBe("fire");
});

it("returns isLoading true while fetching", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("grass");
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});

it("returns isError true when fetch fails", async () => {
  const mockRepository = createMockPokemonDetailRepositoryWithError(new Error("API Error"));

  const { result } = renderHook(() => usePokemonsByType(mockRepository));

  act(() => {
    result.current.selectType("grass");
  });

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
});

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/react/hooks/__tests__/usePokemonsByType.test.ts
Tests must FAIL (RED).
```

---

### **11.2 Implement usePokemonsByType (GREEN)**

### **Prompt for the agent:**

```
Implement usePokemonsByType hook with the overload pattern for DI.

FILE: src/features/pokemon-detail/infrastructure/react/hooks/usePokemonsByType.ts

CONTENT:
import { useState, useCallback, useMemo } from "react";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";
import { PokemonsByTypeViewModel } from "../../../application/view-models/PokemonsByTypeViewModel";
import { HttpPokemonDetailRepository } from "../../http/HttpPokemonDetailRepository";

interface UsePokemonsByTypeResult {
  pokemonNames: string[];
  selectedType: string | null;
  isLoading: boolean;
  isError: boolean;
  selectType: (typeName: string) => void;
}

function usePokemonsByType(): UsePokemonsByTypeResult;
function usePokemonsByType(repository: PokemonDetailRepository): UsePokemonsByTypeResult;
function usePokemonsByType(repository?: PokemonDetailRepository): UsePokemonsByTypeResult {
  const [pokemonNames, setPokemonNames] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const isRepositoryInjected = repository !== undefined;

  const repositoryInstance = useMemo(() => {
    if (isRepositoryInjected) {
      return repository;
    }
    return new HttpPokemonDetailRepository("https://pokeapi.co/api/v2/", {
      pokemonEndpoint: "pokemon/",
      typeEndpoint: "type/",
    });
  }, [isRepositoryInjected, repository]);

  const viewModel = useMemo(
    () => new PokemonsByTypeViewModel(repositoryInstance),
    [repositoryInstance]
  );

  const selectType = useCallback(
    async (typeName: string) => {
      setSelectedType(typeName);
      setIsLoading(true);
      setIsError(false);

      try {
        const pokemonList = await viewModel.loadPokemonsByType(typeName);
        const names = viewModel.getPokemonNames(pokemonList);
        setPokemonNames(names);
      } catch (error) {
        console.error("Error fetching pokemon by type:", error);
        setPokemonNames([]);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [viewModel]
  );

  return {
    pokemonNames,
    selectedType,
    isLoading,
    isError,
    selectType,
  };
}

export default usePokemonsByType;

VERIFICATION:
npm test src/features/pokemon-detail/infrastructure/react/hooks/__tests__/usePokemonsByType.test.ts
All tests must PASS (GREEN).
```

---

## ✅ PHASE 12: UI - PokemonDetailTypes (Humble Component)

### **12.1 Create PokemonDetailTypes.tsx as humble component**

### **Prompt for the agent:**

```
Create PokemonDetailTypes.tsx as a humble component using the new hook.

FILE: src/features/pokemon-detail/ui/PokemonDetailTypes.tsx

CONTENT:
import { SelectButton, SelectButtonList } from "../../../ui";
import usePokemonsByType from "../infrastructure/react/hooks/usePokemonsByType";

interface PokemonDetailTypesProps {
  types: string[];
}

const PokemonDetailTypes = ({ types }: PokemonDetailTypesProps) => {
  const { pokemonNames, selectedType, selectType } = usePokemonsByType();

  return (
    <section
      className="bg-stone-600 rounded-lg p-4 mb-4"
      aria-labelledby="pokemon-type-list-heading"
    >
      <h2
        className="mb-2 text-lg l:text-xl xl:text-2xl font-semibold"
        id="pokemon-type-list-heading"
      >
        Types:
      </h2>
      <SelectButtonList
        aria-live="polite"
        aria-labelledby="pokemon-type-list-heading"
        optionNames={types}
      >
        {(name) => (
          <SelectButton
            key={name}
            value={name}
            selected={selectedType === name}
            onClick={() => selectType(name)}
          >
            {name}
          </SelectButton>
        )}
      </SelectButtonList>

      {pokemonNames.length > 0 && (
        <ul className="flex flex-wrap gap-2 mb-2 mt-4" aria-live="polite">
          {pokemonNames.map((name) => (
            <li className="capitalize" key={name}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PokemonDetailTypes;

IMPORTANT:
- NO useState, useEffect or fetch in component
- Only renders and delegates to hook
- Pure presentational logic

VERIFICATION:
npm run build must pass.
```

---

### **12.2 Update PokemonDetail.tsx to include PokemonDetailTypes**

### **Prompt for the agent:**

```
Update PokemonDetail.tsx to include PokemonDetailTypes.

FILE: src/features/pokemon-detail/ui/PokemonDetail.tsx

UPDATED CONTENT:
import usePokemonDetail from "../infrastructure/react/hooks/usePokemonDetail";
import PokemonEvolutions from "./PokemonEvolutions";
import PokemonStats from "./PokemonStats";
import PokemonDetailTypes from "./PokemonDetailTypes";

interface PokemonDetailProps {
  name: string;
}

const PokemonDetail = ({ name }: PokemonDetailProps) => {
  const { pokemonDetail, evolutions, isLoading, isError } = usePokemonDetail(name);

  if (isLoading) {
    return <p>Loading pokemon details...</p>;
  }

  if (isError) {
    return <p>Error loading pokemon details</p>;
  }

  if (!pokemonDetail) {
    return null;
  }

  return (
    <>
      <section className="flex flex-col gap-4 md:flex-row bg-stone-600 rounded-lg p-4 mb-4">
        <img
          className="w-full md:w-80 xl:w-86 object-contain"
          src={pokemonDetail.imageUrl}
          alt={pokemonDetail.name}
        />
        <div className="w-full">
          {evolutions.length > 0 && (
            <PokemonEvolutions evolutions={evolutions} />
          )}
          {pokemonDetail.stats.length > 0 && (
            <PokemonStats stats={pokemonDetail.stats} />
          )}
        </div>
      </section>

      {pokemonDetail.types.length > 0 && (
        <PokemonDetailTypes types={pokemonDetail.types} />
      )}
    </>
  );
};

export default PokemonDetail;

VERIFICATION:
npm run build must pass.
```

---

### **12.3 Create UI index and update feature exports**

### **Prompt for the agent:**

```
Create index files and update feature exports.

FILE 1: src/features/pokemon-detail/ui/index.ts
export { default as PokemonDetail } from "./PokemonDetail";
export { default as PokemonEvolutions } from "./PokemonEvolutions";
export { default as PokemonStats } from "./PokemonStats";
export { default as PokemonDetailTypes } from "./PokemonDetailTypes";

FILE 2: Update src/features/pokemon-detail/index.ts
export { PokemonDetail } from "./ui";

VERIFICATION:
npm run build must pass.
```

---

## ✅ PHASE 13: Cleanup and Final Verification

### **13.1 Delete legacy files**

### **Prompt for the agent:**

```
Delete legacy files that are no longer needed.

FILES TO DELETE:
1. src/features/pokemon-detail/PokemonDetail.tsx
2. src/features/pokemon-detail/PokemonEvolutions.tsx
3. src/features/pokemon-detail/PokemonStats.tsx
4. src/features/pokemon-detail/PokemonDetailTypes.tsx
5. src/features/pokemon-detail/useStatsGraph.tsx
6. src/features/pokemon-detail/entities.ts (if exists)

CHECK if src/pages/Detail/entities.ts is still used:
- If NOT used anywhere else, delete it too

VERIFICATION:
npm run build
npm test src/pages/Detail/__tests__/Detail.test.tsx
Both must pass without errors.
```

---

### **13.2 Complete final verification**

### **Prompt for the agent:**

```
Run the final verification of the refactor.

COMMANDS:
1. npm run build
2. npm test
3. npm test src/features/pokemon-detail/
4. npm test src/pages/Detail/__tests__/Detail.test.tsx

VERIFICATION CHECKLIST:
- [ ] Build passes without TypeScript errors
- [ ] All feature unit tests pass
- [ ] All Detail page integration tests pass
- [ ] No unused import warnings
- [ ] NO component makes direct fetch calls

NEW TEST COUNT:
- Domain (EvolutionChain): 3 tests
- Infrastructure (Repository): 6 tests
- Application (Use Cases): 11 tests
- Application (ViewModels): 10 tests
- Infrastructure (Hooks): 12 tests
- TOTAL: ~42 new tests

FINAL STRUCTURE:
src/features/pokemon-detail/
├── domain/
│   ├── entities/ (PokemonDetail, EvolutionChain)
│   ├── value-objects/ (PokemonStat, PokemonByType)
│   ├── ports/ (PokemonDetailRepository)
│   └── constants.ts
├── application/
│   ├── use-cases/
│   │   ├── get-pokemon-detail/
│   │   ├── get-evolution-chain/
│   │   └── get-pokemons-by-type/
│   └── view-models/
│       ├── PokemonDetailViewModel
│       └── PokemonsByTypeViewModel
├── infrastructure/
│   ├── http/ (HttpPokemonDetailRepository + DTOs)
│   └── react/hooks/ (usePokemonDetail, usePokemonsByType)
├── ui/ (All humble components)
├── __tests__/mocks.ts
└── index.ts

If everything passes, the refactor is COMPLETE. 🎉
Every component is now a humble component with no direct fetch calls.
```

---

## 📝 Important Notes

### **YAGNI Applied**

| Entity/VO        | Behavior                      | Tests  |
| ---------------- | ----------------------------- | ------ |
| `PokemonStat`    | ❌ Data container             | ❌ NO  |
| `PokemonDetail`  | ❌ Data container             | ❌ NO  |
| `PokemonByType`  | ❌ Data container             | ❌ NO  |
| `EvolutionChain` | ✅ `getEvolutionsExcluding()` | ✅ YES |

### **Feature Independence**

This feature is completely self-contained:

- Has its own `PokemonByType` value object (not imported from `pokemon-list`)
- Has its own `findAllByType` in repository (not shared)
- If `pokemon-list` feature is deleted, this feature continues working

### **Pattern Emergence**

After completing this refactor, review if `PokemonByType` and `findAllByType` should be abstracted to `src/shared/`:

- Both `pokemon-list` and `pokemon-detail` have similar patterns
- This is a candidate for shared domain extraction in a future iteration
- But only extract AFTER both features are stable and the pattern is clear

---

## ✅ Development Checklist Satisfied

### **Domain Layer:**

- [x] Create Value Objects (PokemonStat, PokemonByType - data containers)
- [x] Create Entities (PokemonDetail - data container, EvolutionChain - with behavior)
- [x] Create Ports (PokemonDetailRepository with all methods)
- [x] Tests for Entities with behavior (EvolutionChain)
- [x] Do NOT import React, HTTP, Redux

### **Application Layer:**

- [x] Create Use Cases (GetPokemonDetailUseCase, GetEvolutionChainUseCase, GetPokemonsByTypeUseCase)
- [x] Create ViewModels (PokemonDetailViewModel, PokemonsByTypeViewModel)
- [x] Tests for Use Cases with mocks
- [x] Tests for ViewModels
- [x] Do NOT import React, HTTP, Redux

### **Infrastructure Layer:**

- [x] Create adapters (HttpPokemonDetailRepository with all methods)
- [x] Create React hooks (usePokemonDetail, usePokemonsByType with overloads)
- [x] Tests for adapters
- [x] Tests for hooks

### **UI Layer:**

- [x] Create "humble" components (ALL components)
- [x] Integrate hooks
- [x] Tests for components (uses existing Detail.test.tsx tests)
- [x] Do NOT put business logic in components
- [x] **NO direct fetch calls in any component**

---

**Author:** Ricardo  
**Date:** 2025-12-26  
**Version:** 3.0 (Complete hexagonal refactor - no exceptions)
