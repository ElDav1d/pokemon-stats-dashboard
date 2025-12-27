import { it, expect } from "vitest";
import { GetEvolutionChainUseCase } from "../GetEvolutionChainUseCase";
import {
  mockBulbasaurEvolutionChain,
  createMockPokemonDetailRepository,
  createMockPokemonDetailRepositoryWithError,
} from "../../../../__tests__/mocks";

it("executes and returns evolution chain from species URL", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const useCase = new GetEvolutionChainUseCase(mockRepository);
  const result = await useCase.execute(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );

  expect(result).toBe(mockBulbasaurEvolutionChain);
  expect(mockRepository.findEvolutionChainUrl).toHaveBeenCalledWith(
    "https://pokeapi.co/api/v2/pokemon-species/1/"
  );
  expect(mockRepository.findEvolutionChain).toHaveBeenCalledWith(
    "https://pokeapi.co/api/v2/evolution-chain/1/"
  );
});

it("returns null when speciesUrl is empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();
  const useCase = new GetEvolutionChainUseCase(mockRepository);

  const result = await useCase.execute("");

  expect(result).toBeNull();
  expect(mockRepository.findEvolutionChainUrl).not.toHaveBeenCalled();
});

it("returns null when speciesUrl is null", async () => {
  const mockRepository = createMockPokemonDetailRepository();
  const useCase = new GetEvolutionChainUseCase(mockRepository);

  const result = await useCase.execute(null as unknown as string);

  expect(result).toBeNull();
});

it("propagates repository errors", async () => {
  const mockRepository = createMockPokemonDetailRepositoryWithError(
    new Error("Network error")
  );

  const useCase = new GetEvolutionChainUseCase(mockRepository);

  await expect(
    useCase.execute("https://pokeapi.co/api/v2/pokemon-species/1/")
  ).rejects.toThrow("Network error");
});
