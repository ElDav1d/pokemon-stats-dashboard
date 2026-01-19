import type { PokemonRepository } from "./ports/PokemonRepository.ts";
import { PokemonType } from "../../../shared/domain/value-objects/PokemonType";
import { PokemonReference } from "../../../shared/domain/value-objects";
import { PokemonItem } from "./value-objects/PokemonItem.ts";

class SmokeTestPokemonRepository implements PokemonRepository {
  private readonly pokemonList: PokemonReference[] = [
    new PokemonReference("charmander"),
    new PokemonReference("squirtle"),
    new PokemonReference("bulbasaur"),
  ];

  async findAllByType(type: PokemonType): Promise<PokemonReference[]> {
    console.log(`SMOKE TEST Finding Pokémon by type: ${type.value}`);
    return this.pokemonList;
  }

  async findDetailsByName(name: string): Promise<PokemonItem> {
    // Fake details for each Pokémon
    const details: Record<string, PokemonItem> = {
      charmander: new PokemonItem(
        "charmander",
        6,
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
      ),
      squirtle: new PokemonItem(
        "squirtle",
        5,
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
      ),
      bulbasaur: new PokemonItem(
        "bulbasaur",
        7,
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
      ),
    };
    return details[name] ?? null;
  }
}

const smokeTestPokemonRepository = new SmokeTestPokemonRepository();

(async () => {
  const type = new PokemonType("test-type");
  const listByType = await smokeTestPokemonRepository.findAllByType(type);
  const listOfDetails = await Promise.all(
    listByType.map((p) => smokeTestPokemonRepository.findDetailsByName(p.name))
  );

  listByType.forEach((pokemon, index) => {
    const details = listOfDetails[index];
    console.log(
      `Pokemon: ${pokemon.name},
       Height: ${details?.height},
       Image: ${details?.imageUrl}`
    );
  });
})();

// run npx ts-node src/features/pokemon-list/domain/smokeTest.ts
