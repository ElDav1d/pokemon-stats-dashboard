import { PokemonReference } from "../../../../shared/domain/value-objects/PokemonReference";
import { PokemonDetailRepository } from "../../domain/ports/PokemonDetailRepository";
import { GetPokemonsByTypeUseCase } from "../../application/use-cases/get-pokemons-by-type/GetPokemonsByTypeUseCase";

export class PokemonsByTypeViewModel {
  private readonly getPokemonsByTypeUseCase: GetPokemonsByTypeUseCase;

  constructor(private repository: PokemonDetailRepository) {
    this.getPokemonsByTypeUseCase = new GetPokemonsByTypeUseCase(
      this.repository,
    );
  }

  async loadPokemonsByType(
    typeName: string | null,
  ): Promise<PokemonReference[]> {
    if (!typeName || typeName.trim() === "") {
      return [];
    }
    return await this.getPokemonsByTypeUseCase.execute(typeName);
  }

  getPokemonNames(pokemonList: PokemonReference[]): string[] {
    return pokemonList.map((pokemon) => pokemon.name);
  }
}
