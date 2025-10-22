import { UuidGenerator } from "../../../../../lib/IdGenerator";
import { mapToDomainList } from "../../../infrastructure/http/dto/mappers";
import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonRepository } from "../../../domain/ports/PokemonRepository";
import { PokemonType } from "../../../domain/value-objects/PokemonType";

export class GetPokemonListUseCase {
  constructor(private readonly repository: PokemonRepository) {}

  async execute(type: PokemonType): Promise<PokemonListItem[]> {
    const pokemonsByType = await this.repository.findAllByType(type);

    const detailsPromises = pokemonsByType.map((pokemon) =>
      this.repository.findDetailsByName(pokemon.name)
    );

    const details = await Promise.all(detailsPromises);

    const idGenerator = new UuidGenerator();
    const items = mapToDomainList(pokemonsByType, details, idGenerator);

    return items;
  }
}
