// smokeTest PokemonRepository

import { Pokemon } from "./entities/Pokemon.ts";
import type { PokemonRepository } from "./ports/PokemonRepository.ts";
import { PokemonType } from "./value-objects/PokemonType.ts";

export class SmokeTestPokemonRepository implements PokemonRepository {
  private readonly pokemonList: Pokemon[] = [
    new Pokemon(
      "charmander",
      "https://pokeapi.co/api/v2/pokemon/4",
      6,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
    ),
    new Pokemon(
      "squirtle",
      "https://pokeapi.co/api/v2/pokemon/7",
      5,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
    ),
    new Pokemon(
      "bulbasaur",
      "https://pokeapi.co/api/v2/pokemon/1",
      7,
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
    ),
  ];

  async findByType(type: PokemonType): Promise<Pokemon[]> {
    console.log(`SMOKE TEST Finding Pokémon by type: ${type.value}`);
    return this.pokemonList.filter((pokemon) =>
      pokemon.name.includes(type.value)
    );
  }
}

const smokeTestPokemonRepository = new SmokeTestPokemonRepository();

(async () => {
  const type = new PokemonType("char");
  const pokemons = await smokeTestPokemonRepository.findByType(type);
  console.log("Smoke Test Pokémon List:", pokemons);
})();

// run npx ts-node src/features/pokemon-list/domain/smokeTest.ts
