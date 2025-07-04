import { IPokemonTypeItem } from "../../../shared/entities";

class PokemonType {
  private readonly pokemonTypeItem: IPokemonTypeItem;

  constructor(pokemonTypeItem: IPokemonTypeItem) {
    this.pokemonTypeItem = pokemonTypeItem;
  }

  get name(): string {
    return this.pokemonTypeItem.name;
  }

  static get defaultType(): string {
    return "normal";
  }
}
export default PokemonType;
