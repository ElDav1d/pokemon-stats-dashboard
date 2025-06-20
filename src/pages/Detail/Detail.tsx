import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { PokemonDetail } from "../../features/pokemon-detail";

const Detail = () => {
  const { name } = useParams();

  return (
    <>
      <header className="max-w-[1240px] mx-6 my-6 xl:mx-auto">
        <h1 className="text-xl l:text-2xl xl:text-3xl">
          Pokemon Detail for {name}
        </h1>
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
