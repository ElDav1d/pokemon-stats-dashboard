import { EvolutionChain } from "../../../domain/entities/EvolutionChain";
import { PokemonDetailRepository } from "../../../domain/ports/PokemonDetailRepository";

export class GetEvolutionChainUseCase {
  constructor(private readonly repository: PokemonDetailRepository) {}

  async execute(speciesUrl: string | null): Promise<EvolutionChain | null> {
    if (!speciesUrl || speciesUrl.trim() === "") {
      return null;
    }

    const evolutionChainUrl = await this.repository.findEvolutionChainUrl(
      speciesUrl
    );
    return await this.repository.findEvolutionChain(evolutionChainUrl);
  }
}
