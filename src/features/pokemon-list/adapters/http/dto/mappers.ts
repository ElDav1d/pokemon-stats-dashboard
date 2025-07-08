import { PokemonListItem } from "../../../domain/entities/PokemonListItem";
import { PokemonByName } from "../../../domain/value-objects/PokemonByName";
import { PokemonByType } from "../../../domain/value-objects/PokemonByType";
import { v4 as uuidv4 } from "uuid";

export function mapToDomainList(
  list: PokemonByType[],
  details: PokemonByName[]
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
      uuidv4(),
      item.name,
      item.url,
      detail.height,
      detail.imageUrl
    );
  });
}
