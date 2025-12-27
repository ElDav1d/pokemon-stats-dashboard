import { PokemonStat } from "../value-objects/PokemonStat";

export class PokemonDetail {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly height: number,
    public readonly weight: number,
    public readonly imageUrl: string,
    public readonly stats: PokemonStat[],
    public readonly types: string[],
    public readonly speciesUrl: string
  ) {}
}
