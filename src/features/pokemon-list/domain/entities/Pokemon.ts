export class Pokemon {
  public readonly name: string;
  public readonly url: string;
  public height: number;
  public imageUrl: string;

  constructor(name: string, url: string, height: number, imageUrl: string) {
    this.name = name;
    this.url = url;
    this.height = height;
    this.imageUrl = imageUrl;
  }
}
