import { PokemonTypesRepository } from "../../../domain/ports/PokemonTypesRepository";
import { PokemonType } from "../../../../../shared/domain/value-objects/PokemonType";

export class GetPokemonTypesUseCase {
  constructor(private readonly repository: PokemonTypesRepository) {}

  async execute(): Promise<PokemonType[]> {
    return await this.repository.findAll();
  }
}
