export class PokemonListItem {
  public readonly id: string;
  public readonly name: string;
  public readonly url: string;
  public height: number;
  public imageUrl: string;

  constructor(
    id: string,
    name: string,
    url: string,
    height: number,
    imageUrl: string
  ) {
    this.id = id;
    this.name = name;
    this.url = url;
    this.height = height;
    this.imageUrl = imageUrl;
  }
}
