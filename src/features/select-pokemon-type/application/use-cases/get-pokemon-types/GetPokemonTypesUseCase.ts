import { PokemonTypesRepository } from "../../../domain/ports/PokemonTypesRepository";
import { PokemonTypeItem } from "../../../domain/entities/PokemonTypeItem";

export class GetPokemonTypesUseCase {
  constructor(private readonly repository: PokemonTypesRepository) {}

  async execute(): Promise<PokemonTypeItem[]> {
    return await this.repository.findAll();
  }
}
