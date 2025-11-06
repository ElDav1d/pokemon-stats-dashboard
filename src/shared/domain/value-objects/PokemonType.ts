export class PokemonType {
  public readonly value: string;

  constructor(value: string) {
    if (!value || value.trim() === "") {
      throw new Error("Pokemon type cannot be empty");
    }
    this.value = value;
  }
}
