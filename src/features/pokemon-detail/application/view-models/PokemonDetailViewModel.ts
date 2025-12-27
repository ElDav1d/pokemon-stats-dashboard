import { PokemonDetail } from "../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../domain/ports/PokemonDetailRepository";
import { GetPokemonDetailUseCase } from "../use-cases/get-pokemon-detail/GetPokemonDetailUseCase";
import { GetEvolutionChainUseCase } from "../use-cases/get-evolution-chain/GetEvolutionChainUseCase";

export class PokemonDetailViewModel {
  private readonly getPokemonDetailUseCase: GetPokemonDetailUseCase;
  private readonly getEvolutionChainUseCase: GetEvolutionChainUseCase;

  constructor(repository: PokemonDetailRepository) {
    this.getPokemonDetailUseCase = new GetPokemonDetailUseCase(repository);
    this.getEvolutionChainUseCase = new GetEvolutionChainUseCase(repository);
  }

  async loadPokemonDetail(name: string): Promise<PokemonDetail | null> {
    if (!name || name.trim() === "") {
      return null;
    }
    return await this.getPokemonDetailUseCase.execute(name);
  }

  async loadEvolutionChain(speciesUrl: string): Promise<EvolutionChain | null> {
    return await this.getEvolutionChainUseCase.execute(speciesUrl);
  }

  getEvolutionsExcluding(chain: EvolutionChain | null, currentName: string): string[] {
    if (!chain) {
      return [];
    }
    return chain.getEvolutionsExcluding(currentName);
  }
}
