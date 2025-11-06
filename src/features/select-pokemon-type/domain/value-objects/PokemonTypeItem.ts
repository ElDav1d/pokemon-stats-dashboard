export class PokemonTypeItem {
  constructor(public readonly name: string) {
    if (!name || name.trim() === "") {
      throw new Error("Pokemon type name cannot be empty");
    }
  }
}
