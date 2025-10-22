import { PokemonListItem } from "../../domain/entities/PokemonListItem";
import { PokemonByName } from "../../domain/value-objects/PokemonByName";
import { PokemonByType } from "../../domain/value-objects/PokemonByType";
import { IdGenerator } from "../../../../lib/IdGenerator";

export function mapToDomainList(
  list: PokemonByType[],
  details: PokemonByName[],
  idGenerator: IdGenerator
): PokemonListItem[] {
  return list.map((item, index) => {
    const detail = details[index];

    if (!detail) {
      throw new Error(`Detail not found for item: ${item.name}`);
    }

    if (item.name !== detail.name) {
      throw new Error(
        `Name mismatch: item "${item.name}" does not match detail "${detail.name}"`
      );
    }

    return new PokemonListItem(
      idGenerator.generate(),
      item.name,
      item.url,
      detail.height,
      detail.imageUrl
    );
  });
}
