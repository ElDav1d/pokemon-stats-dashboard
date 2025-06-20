import { SelectPokemonType } from "../../features/select-pokemon-type";
import { PokemonList } from "../../features/pokemon-list";

const Home = () => {
  return (
    <article>
      <h1>Pokemon Stats Dashboard</h1>
      <SelectPokemonType />
      <PokemonList />
    </article>
  );
};

export default Home;
