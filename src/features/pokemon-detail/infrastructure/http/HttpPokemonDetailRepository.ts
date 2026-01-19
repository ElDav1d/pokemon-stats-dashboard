import { PokemonDetail } from "../../domain/entities/PokemonDetail";
import { EvolutionChain } from "../../domain/entities/EvolutionChain";
import { PokemonStat } from "../../domain/value-objects/PokemonStat";
import { PokemonReference } from "../../../../shared/domain/value-objects";
import { PokemonDetailRepository } from "../../domain/ports/PokemonDetailRepository";
import {
  PokemonDetailResponse,
  EvolutionChainResponse,
  EvolutionChainLink,
  SpeciesResponse,
  PokemonByTypeResponse,
} from "./dto";

interface HttpPokemonDetailRepositoryConfig {
  pokemonEndpoint: string;
  typeEndpoint: string;
}

export class HttpPokemonDetailRepository implements PokemonDetailRepository {
  constructor(
    private readonly baseUrl: string,
    private readonly config: HttpPokemonDetailRepositoryConfig
  ) {}

  async findByName(name: string): Promise<PokemonDetail> {
    const response = await fetch(
      `${this.baseUrl}${this.config.pokemonEndpoint}${name}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon: ${name}`);
    }

    const data: PokemonDetailResponse = await response.json();

    return new PokemonDetail(
      data.id,
      data.name,
      data.height,
      data.weight,
      data.sprites.front_default,
      data.stats.map(
        (stat) => new PokemonStat(stat.stat.name, stat.base_stat, stat.effort)
      ),
      data.types.map((type) => type.type.name),
      data.species.url
    );
  }

  async findEvolutionChainUrl(speciesUrl: string): Promise<string> {
    const response = await fetch(speciesUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch species: ${speciesUrl}`);
    }

    const data: SpeciesResponse = await response.json();
    return data.evolution_chain.url;
  }

  async findEvolutionChain(evolutionChainUrl: string): Promise<EvolutionChain> {
    const response = await fetch(evolutionChainUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch evolution chain: ${evolutionChainUrl}`);
    }

    const data: EvolutionChainResponse = await response.json();
    const pokemonNames = this.parseEvolutionChain(data.chain);

    return new EvolutionChain(pokemonNames);
  }

  async findAllByType(typeName: string): Promise<PokemonReference[]> {
    const response = await fetch(
      `${this.baseUrl}${this.config.typeEndpoint}${typeName}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pokemon by type: ${typeName}`);
    }

    const data: PokemonByTypeResponse = await response.json();

    return data.pokemon.map(
      (slot) => new PokemonReference(slot.pokemon.name)
    );
  }

  private parseEvolutionChain(chain: EvolutionChainLink): string[] {
    const names: string[] = [chain.species.name];

    for (const evolution of chain.evolves_to) {
      names.push(...this.parseEvolutionChain(evolution));
    }

    return names;
  }
}
