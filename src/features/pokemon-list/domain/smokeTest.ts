import { url } from "../../../lib/constants.ts";
import type { PokemonRepository } from "./ports/PokemonRepository.ts";
import { PokemonType } from "./value-objects/PokemonType.ts";
import { PokemonByType } from "./value-objects/PokemonByType.ts";
import { PokemonByName } from "./value-objects/PokemonByName.ts";

class SmokeTestPokemonRepository implements PokemonRepository {
  private readonly pokemonList: PokemonByType[] = [
    new PokemonByType("charmander", `${url.BASE}${url.POKEMON}4/`),
    new PokemonByType("squirtle", `${url.BASE}${url.POKEMON}7/`),
    new PokemonByType("bulbasaur", `${url.BASE}${url.POKEMON}1/`),
  ];

  async findAllByType(type: PokemonType): Promise<PokemonByType[]> {
    console.log(`SMOKE TEST Finding Pokémon by type: ${type.value}`);
    return this.pokemonList;
  }

  async findDetailsByName(name: string): Promise<PokemonByName | null> {
    // Fake details for each Pokémon
    const details: Record<string, PokemonByName> = {
      charmander: new PokemonByName(
        6,
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png"
      ),
      squirtle: new PokemonByName(
        5,
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png"
      ),
      bulbasaur: new PokemonByName(
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
       URL: ${pokemon.url},
       Height: ${details?.height},
       Image: ${details?.imageUrl}`
    );
  });
})();

// run npx ts-node src/features/pokemon-list/domain/smokeTest.ts
