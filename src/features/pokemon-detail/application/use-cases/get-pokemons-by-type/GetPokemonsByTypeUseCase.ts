import { PokemonReference } from "../../../../../shared/domain/value-objects";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

export class GetPokemonsByTypeUseCase {
  constructor(private readonly repository: PokemonDetailRepository) {}

  async execute(typeName: string): Promise<PokemonReference[]> {
    if (!typeName || typeName.trim() === "") {
      throw new Error("Type name is required");
    }

    return await this.repository.findAllByType(typeName.toLowerCase());
  }
}
