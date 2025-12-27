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
  (mockRepository.findByName as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockPokemonDetail
  );

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

  await expect(useCase.execute("   ")).rejects.toThrow(
    "Pokemon name is required"
  );
});

it("propagates repository errors", async () => {
  const mockRepository = createMockRepository();
  (mockRepository.findByName as ReturnType<typeof vi.fn>).mockRejectedValue(
    new Error("Network error")
  );

  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("bulbasaur")).rejects.toThrow("Network error");
});
