export class PokemonItem {
  public readonly name: string;
  public readonly height: number;
  public readonly imageUrl: string;

  constructor(name: string, height: number, imageUrl: string) {
    this.name = name;
    this.height = height;
    this.imageUrl = imageUrl;
  }
}
