import { PokemonRepository } from "../../domain/ports/PokemonRepository";
import { PokemonType } from "../../domain/value-objects/PokemonType";
import { Pokemon } from "../../domain/entities/Pokemon";

export class GetPokemonListUseCase {
  constructor(private readonly repository: PokemonRepository) {}

  async execute(type: PokemonType): Promise<Pokemon[]> {
    return this.repository.findByType(type);
  }
}
