export class PokemonTypeItem {
  constructor(
    public readonly name: string,
    public readonly url: string
  ) {
    if (!name || name.trim() === "") {
      throw new Error("Pokemon type name cannot be empty");
    }

    if (!url || !url.startsWith("http")) {
      throw new Error("Pokemon type URL must be a valid HTTP URL");
    }
  }
}
