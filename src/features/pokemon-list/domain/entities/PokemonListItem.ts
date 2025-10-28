export class PokemonListItem {
  public readonly id: string;
  public readonly name: string;
  public readonly height: number;
  public readonly imageUrl: string;

  constructor(id: string, name: string, height: number, imageUrl: string) {
    this.id = id;
    this.name = name;
    this.height = height;
    this.imageUrl = imageUrl;
  }
}
