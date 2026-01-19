import { it, expect, vi } from "vitest";
import { GetPokemonsByTypeUseCase } from "../GetPokemonsByTypeUseCase";
import { PokemonReference } from "../../../../domain";
import { PokemonDetailRepository } from "../../../../domain";

const createMockRepository = (): PokemonDetailRepository => ({
  findByName: vi.fn(),
  findEvolutionChainUrl: vi.fn(),
  findEvolutionChain: vi.fn(),
  findAllByType: vi.fn(),
});

it("returns pokemon list for a type", async () => {
  const mockRepository = createMockRepository();
  const mockPokemonList = [
    new PokemonReference("bulbasaur"),
    new PokemonReference("ivysaur"),
  ];
  (mockRepository.findAllByType as ReturnType<typeof vi.fn>).mockResolvedValue(
    mockPokemonList
  );

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
