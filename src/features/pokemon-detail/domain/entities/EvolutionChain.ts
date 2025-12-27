export class EvolutionChain {
  constructor(public readonly pokemonNames: string[]) {}

  /**
   * Returns the list of evolutions excluding the current pokemon.
   * This behavior is used in PokemonEvolutions.tsx to show
   * only the evolutions the user can navigate to.
   */
  getEvolutionsExcluding(currentName: string): string[] {
    return this.pokemonNames.filter((name) => name !== currentName);
  }
}
