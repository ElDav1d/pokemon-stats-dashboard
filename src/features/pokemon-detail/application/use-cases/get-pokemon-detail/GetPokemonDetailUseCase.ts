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
