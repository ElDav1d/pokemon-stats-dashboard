import { mapToDomainList } from "../../../adapters/http/dto/mappers";
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

    const pokemonListItems = mapToDomainList(pokemonsByType, details);

    return pokemonListItems;
  }
}
