import { it, expect } from "vitest";
import { GetPokemonDetailUseCase } from "../GetPokemonDetailUseCase";
import {
  mockBulbasaurDetail,
  createMockPokemonDetailRepository,
  createMockPokemonDetailRepositoryWithError,
} from "../../../../__tests__/mocks";

it("executes and returns pokemon detail from repository", async () => {
  const mockRepository = createMockPokemonDetailRepository();

  const useCase = new GetPokemonDetailUseCase(mockRepository);
  const result = await useCase.execute("bulbasaur");

  expect(result).toBe(mockBulbasaurDetail);
  expect(mockRepository.findByName).toHaveBeenCalledWith("bulbasaur");
});

it("throws error when pokemon name is empty", async () => {
  const mockRepository = createMockPokemonDetailRepository();
  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("")).rejects.toThrow("Pokemon name is required");
});

it("throws error when pokemon name is only whitespace", async () => {
  const mockRepository = createMockPokemonDetailRepository();
  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("   ")).rejects.toThrow(
    "Pokemon name is required"
  );
});

it("propagates repository errors", async () => {
  const mockRepository = createMockPokemonDetailRepositoryWithError(
    new Error("Network error")
  );

  const useCase = new GetPokemonDetailUseCase(mockRepository);

  await expect(useCase.execute("bulbasaur")).rejects.toThrow("Network error");
});
