import { SelectPokemonType } from "../../features/select-pokemon-type";
import { PokemonList } from "../../features/pokemon-list";

const Home = () => {
  return (
    <>
      <header className="max-w-[1240px] mx-6 my-6 xl:mx-auto">
        <h1 className="text-xl l:text-2xl xl:text-3xl">Pokemon Dashboard</h1>
      </header>
      <main className="max-w-[1240px] mx-6 my-6 xl:mx-auto">
        <article>
          <SelectPokemonType />
          <PokemonList />
        </article>
      </main>
    </>
  );
};

export default Home;
