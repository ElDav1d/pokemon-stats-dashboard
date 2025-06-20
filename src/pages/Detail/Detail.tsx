import { Link, useParams } from "react-router-dom";

import { PokemonDetail } from "../../features/pokemon-detail";

const Detail = () => {
  const { name } = useParams();

  return (
    <>
      <header className="w-fulL max-w-[1240px] mx-6 my-6 xl:mx-auto">
        <h1 className="text-3xl xl:text-5xl capitalize">{name}</h1>
        <nav>
          <Link to="/" className="text-blue-500 hover:underline">
            Home
          </Link>
        </nav>
      </header>
      <main className="max-w-[1240px] mx-6 my-6 xl:mx-auto">
        <article>{name && <PokemonDetail name={name} />}</article>
      </main>
    </>
  );
};

export default Detail;
