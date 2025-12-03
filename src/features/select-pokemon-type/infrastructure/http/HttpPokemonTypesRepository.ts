import { PokemonTypesRepository } from "../../domain/ports/PokemonTypesRepository";
import { PokemonType } from "../../../../shared/domain/value-objects/PokemonType";

interface TypeResponse {
  results: Array<{ name: string; url: string }>;
}

export class HttpPokemonTypesRepository implements PokemonTypesRepository {
  constructor(private readonly baseUrl: string) {}

  async findAll(): Promise<PokemonType[]> {
    const response = await fetch(`${this.baseUrl}type`);

    if (!response.ok) {
      throw new Error("Failed to fetch pokemon types");
    }

    const data: TypeResponse = await response.json();

    return data.results.map((item) => new PokemonType(item.name));
  }
}
