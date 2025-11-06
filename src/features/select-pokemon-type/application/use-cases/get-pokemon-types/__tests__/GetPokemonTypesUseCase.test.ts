import { it, expect, vi } from "vitest";
import { GetPokemonTypesUseCase } from "../GetPokemonTypesUseCase";
import { PokemonTypesRepository } from "../../../../domain/ports/PokemonTypesRepository";
import { PokemonType } from "../../../../../../shared/domain/value-objects/PokemonType";

it("should return a list of pokemon types from repository", async () => {
  const mockTypes = [
    new PokemonType("normal"),
    new PokemonType("fighting"),
  ];

  const mockRepository: PokemonTypesRepository = {
    findAll: vi.fn().mockResolvedValue(mockTypes),
  };

  const useCase = new GetPokemonTypesUseCase(mockRepository);
  const result = await useCase.execute();

  expect(result).toEqual(mockTypes);
  expect(mockRepository.findAll).toHaveBeenCalledTimes(1);
});

it("should propagate errors from repository", async () => {
  const mockRepository: PokemonTypesRepository = {
    findAll: vi.fn().mockRejectedValue(new Error("Network error")),
  };

  const useCase = new GetPokemonTypesUseCase(mockRepository);

  await expect(useCase.execute()).rejects.toThrow("Network error");
});
